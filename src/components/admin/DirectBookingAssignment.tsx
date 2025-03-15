
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowRight } from 'lucide-react';

const DirectBookingAssignment = () => {
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch unprocessed bookings
  const { 
    data: unprocessedBookings, 
    isLoading: isLoadingBookings,
    refetch: refetchBookings
  } = useQuery({
    queryKey: ['direct-unprocessed-bookings'],
    queryFn: async () => {
      try {
        // First get all bookings that are pending or confirmed
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('id, reference_code, origin, destination, status')
          .in('status', ['pending', 'confirmed'])
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (!bookings || bookings.length === 0) {
          return [];
        }
        
        // For each booking check if it has already been assigned
        const filteredBookings = [];
        
        for (const booking of bookings) {
          const { data: serviceOrders, error: ordersError } = await supabase
            .from('service_orders')
            .select('id')
            .ilike('notes', `%Reserva #${booking.reference_code}%`)
            .limit(1);
            
          if (ordersError) throw ordersError;
          
          if (!serviceOrders || serviceOrders.length === 0) {
            filteredBookings.push(booking);
          }
        }
        
        return filteredBookings;
      } catch (error) {
        console.error('Error fetching unprocessed bookings:', error);
        throw error;
      }
    }
  });
  
  // Fetch active companies
  const { 
    data: companies, 
    isLoading: isLoadingCompanies 
  } = useQuery({
    queryKey: ['active-companies-direct'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'active')
        .order('name', { ascending: true });
        
      if (error) throw error;
      return data;
    }
  });

  // Process the booking assignment
  const assignBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      setIsProcessing(true);
      try {
        if (!selectedCompany) {
          throw new Error('No company selected');
        }
        
        // Direct call to the edge function to process the booking
        const response = await supabase.functions.invoke('process_specific_booking', {
          method: 'POST',
          body: { 
            booking_id: bookingId,
            company_id: selectedCompany  // Add company_id to directly assign
          }
        });
        
        if (response.error) throw response.error;
        return response.data;
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Reserva atribuída com sucesso para ${data.company_name}`);
        setSelectedBooking(null);
        setSelectedCompany(null);
        refetchBookings();
      } else {
        toast.error(`Falha na atribuição: ${data.message}`);
      }
    },
    onError: (error: any) => {
      toast.error(`Erro ao atribuir reserva: ${error.message || 'Falha desconhecida'}`);
    }
  });

  const handleAssign = () => {
    if (!selectedBooking) {
      toast.error('Selecione uma reserva');
      return;
    }
    
    if (!selectedCompany) {
      toast.error('Selecione uma empresa');
      return;
    }
    
    assignBookingMutation.mutate(selectedBooking);
  };

  const getBookingLabel = (booking: any) => {
    return `${booking.reference_code} (${booking.origin.substring(0, 15)} → ${booking.destination.substring(0, 15)})`;
  };

  const isLoading = isLoadingBookings || isLoadingCompanies;
  const hasUnprocessedBookings = unprocessedBookings && unprocessedBookings.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atribuição Rápida</CardTitle>
        <CardDescription>
          Atribua rapidamente uma reserva a uma empresa específica
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <p>Carregando dados...</p>
          </div>
        ) : !hasUnprocessedBookings ? (
          <div className="text-center p-4 text-muted-foreground">
            Nenhuma reserva disponível para atribuição
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Reserva</label>
              <Select 
                value={selectedBooking || ""}
                onValueChange={setSelectedBooking}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma reserva" />
                </SelectTrigger>
                <SelectContent>
                  {unprocessedBookings.map((booking: any) => (
                    <SelectItem key={booking.id} value={booking.id}>
                      {getBookingLabel(booking)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Empresa</label>
              <Select 
                value={selectedCompany || ""}
                onValueChange={setSelectedCompany}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies?.map((company: any) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleAssign} 
              disabled={isProcessing || !selectedBooking || !selectedCompany}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Processando...
                </>
              ) : (
                <>
                  Atribuir Reserva <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DirectBookingAssignment;
