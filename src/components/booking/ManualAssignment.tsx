
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Building, AlertCircle } from 'lucide-react';

const ManualAssignment = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch unprocessed bookings
  const { 
    data: unprocessedBookings, 
    isLoading: isLoadingBookings,
    refetch: refetchBookings
  } = useQuery({
    queryKey: ['manual-unprocessed-bookings'],
    queryFn: async () => {
      // Get bookings that are pending or confirmed but don't have service orders
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, reference_code, origin, destination')
        .in('status', ['pending', 'confirmed'])
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (bookingsError) throw bookingsError;
      
      const filteredBookings = await Promise.all(bookings.map(async (booking) => {
        // Check if this booking has a service order
        const { data: serviceOrders, error: ordersError } = await supabase
          .from('service_orders')
          .select('id')
          .ilike('notes', `%Reserva #${booking.reference_code}%`)
          .limit(1);
          
        if (ordersError) {
          console.error(`Error checking service order for booking ${booking.reference_code}:`, ordersError);
          return booking;
        }
        
        // If there's no service order, include this booking
        if (!serviceOrders || serviceOrders.length === 0) {
          return booking;
        }
        
        return null;
      }));
      
      // Filter out nulls (bookings that already have service orders)
      return filteredBookings.filter(Boolean);
    }
  });
  
  // Fetch active companies
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['active-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, queue_position')
        .eq('status', 'active')
        .order('queue_position', { ascending: true, nullsLast: true })
        .order('name', { ascending: true });
        
      if (error) throw error;
      return data;
    }
  });
  
  // Mutation for manually assigning a booking to a company
  const assignMutation = useMutation({
    mutationFn: async ({ bookingId, companyId }) => {
      // Get booking details
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();
        
      if (bookingError) throw bookingError;
      
      // Get company details
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();
        
      if (companyError) throw companyError;
      
      // Create service order
      const serviceOrderData = {
        company_id: companyId,
        origin: booking.origin,
        destination: booking.destination,
        pickup_date: booking.travel_date,
        delivery_date: booking.return_date || null,
        status: 'pending',
        notes: `Reserva #${booking.reference_code} - ATRIBUIÇÃO MANUAL - Empresa: ${company.name} - ${booking.additional_notes || 'Sem observações'}`
      };
      
      const { data: serviceOrder, error: serviceOrderError } = await supabase
        .from('service_orders')
        .insert(serviceOrderData)
        .select()
        .single();
        
      if (serviceOrderError) throw serviceOrderError;
      
      // Update booking status to confirmed
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);
        
      if (updateError) throw updateError;
      
      // Update company's queue position
      const response = await supabase.functions.invoke('update_company_queue_position', {
        method: 'POST',
        body: { company_id: companyId }
      });
      
      if (response.error) {
        console.warn('Warning: Failed to update company queue position:', response.error);
      }
      
      return { serviceOrder, booking, company };
    },
    onSuccess: (data) => {
      toast.success(`Reserva ${data.booking.reference_code} atribuída manualmente para ${data.company.name}`);
      refetchBookings();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao atribuir reserva: ${error.message}`);
    }
  });
  
  const handleAssign = () => {
    if (!selectedBooking || !selectedCompany) {
      toast.error('Selecione uma reserva e uma empresa');
      return;
    }
    
    assignMutation.mutate({
      bookingId: selectedBooking,
      companyId: selectedCompany
    });
  };
  
  const getBookingLabel = (booking) => {
    return `${booking.reference_code} (${booking.origin} → ${booking.destination})`;
  };
  
  const getCompanyLabel = (company) => {
    return `${company.name}${company.queue_position ? ` (Posição: ${company.queue_position})` : ''}`;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atribuição Manual</CardTitle>
        <CardDescription>
          Atribua manualmente uma reserva a uma empresa quando o sistema automático falhar
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(isLoadingBookings || isLoadingCompanies) ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (!unprocessedBookings || unprocessedBookings.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Não há reservas pendentes para atribuição manual
            </p>
          </div>
        ) : (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Building className="h-4 w-4 mr-2" />
                Atribuir Reserva Manualmente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Atribuição Manual de Reserva</DialogTitle>
                <DialogDescription>
                  Selecione uma reserva e uma empresa para atribuição manual.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="booking" className="text-sm font-medium">
                    Reserva
                  </label>
                  <Select 
                    onValueChange={(value) => setSelectedBooking(value)}
                    value={selectedBooking}
                  >
                    <SelectTrigger id="booking">
                      <SelectValue placeholder="Selecione uma reserva" />
                    </SelectTrigger>
                    <SelectContent>
                      {unprocessedBookings.map((booking) => (
                        <SelectItem key={booking.id} value={booking.id}>
                          {getBookingLabel(booking)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="company" className="text-sm font-medium">
                    Empresa
                  </label>
                  <Select 
                    onValueChange={(value) => setSelectedCompany(value)}
                    value={selectedCompany}
                  >
                    <SelectTrigger id="company">
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {getCompanyLabel(company)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAssign}
                  disabled={assignMutation.isPending || !selectedBooking || !selectedCompany}
                >
                  {assignMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Atribuindo...
                    </>
                  ) : (
                    'Atribuir'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="text-xs text-muted-foreground w-full">
          Utilize esta opção apenas quando a atribuição automática falhar. A posição da empresa na fila será atualizada normalmente.
        </div>
      </CardFooter>
    </Card>
  );
};

export default ManualAssignment;
