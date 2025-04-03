import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BookingTable from '@/components/admin/BookingTable';
import { Booking } from '@/types/booking';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalBookings, setTotalBookings] = useState(0);

  useEffect(() => {
    fetchBookings();
    fetchTotalCount();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = bookings.filter(booking =>
        booking.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.reference_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.company_name && booking.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredBookings(filtered);
    } else {
      setFilteredBookings(bookings);
    }
  }, [searchTerm, bookings]);

  const fetchTotalCount = async () => {
    try {
      const { count, error } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      setTotalBookings(count || 0);
    } catch (error) {
      console.error('Error fetching total bookings count:', error);
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // Query for bookings data first without trying to join service_orders
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          companies(name)
        `)
        .order('created_at', { ascending: false });
      
      if (bookingsError) throw bookingsError;

      // If we have bookings data, we'll format it
      if (bookingsData) {
        // Now fetch service orders separately to avoid join issues
        const formattedBookings: Booking[] = await Promise.all(
          bookingsData.map(async (booking) => {
            // Ensure booking status is one of the allowed values
            const validStatus = ['pending', 'confirmed', 'completed', 'cancelled'].includes(booking.status) 
              ? booking.status as "pending" | "confirmed" | "completed" | "cancelled"
              : "pending";
            
            // Try to get service orders related to this booking
            const { data: serviceOrdersData, error: serviceOrdersError } = await supabase
              .from('service_orders')
              .select('id, status')
              .eq('company_id', booking.company_id)
              .order('created_at', { ascending: false });
            
            // Determine if the booking has service orders
            const hasServiceOrder = !serviceOrdersError && 
              Array.isArray(serviceOrdersData) && 
              serviceOrdersData.length > 0;
            
            // Create the booking object with correct type safety
            return {
              ...booking,
              status: validStatus,
              company_name: booking.company_name || booking.companies?.name || null,
              company_id: booking.company_id || null,
              // Set service_orders as an empty array if there was an error or no data
              service_orders: hasServiceOrder ? serviceOrdersData : [],
              // Add has_service_order flag based on our check
              has_service_order: hasServiceOrder
            } as Booking;
          })
        );
        
        setBookings(formattedBookings);
        setFilteredBookings(formattedBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Falha ao carregar reservas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchBookings();
    fetchTotalCount();
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center">
          <ArrowRight className="mr-2 h-5 w-5" />
          Monitoramento de Reservas
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            (Total: {totalBookings})
          </span>
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por origem, destino, status ou código de referência..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <BookingTable 
          bookings={filteredBookings} 
          isLoading={isLoading}
          onRefreshData={handleRefresh}
        />
      </CardContent>
    </Card>
  );
};

export default BookingManagement;
