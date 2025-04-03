
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/booking';
import { createManualServiceOrder } from '@/services/booking/serviceOrderCreationService';
import BookingRow from './booking-table/BookingRow';
import BookingError from './booking-table/BookingError';
import EmptyState from './booking-table/EmptyState';
import LoadingState from './booking-table/LoadingState';

interface BookingTableProps {
  bookings: Booking[];
  isLoading: boolean;
  onRefreshData: () => void;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  isLoading,
  onRefreshData
}) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    toast.info(`Detalhes da reserva: ${booking.reference_code}`);
  };

  const handleStatusChange = async (booking: Booking, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', booking.id);
      
      if (error) throw error;
      
      toast.success(`Status da reserva atualizado para: ${translateStatus(newStatus)}`);
      onRefreshData();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Falha ao atualizar status da reserva');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCreateServiceOrder = async (booking: Booking) => {
    setCreatingOrder(prev => ({ ...prev, [booking.id]: true }));
    setErrors(prev => ({ ...prev, [booking.id]: '' }));
    
    try {
      const { serviceOrder, error } = await createManualServiceOrder(booking);
      
      if (error) {
        throw error;
      }
      
      if (!serviceOrder) {
        throw new Error("Nenhuma ordem de serviço foi retornada");
      }
      
      toast.success("Ordem de serviço criada com sucesso!");
      onRefreshData();
    } catch (error) {
      console.error('Exception creating service order:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setErrors(prev => ({ ...prev, [booking.id]: errorMessage }));
      toast.error("Erro ao criar ordem de serviço");
    } finally {
      setCreatingOrder(prev => ({ ...prev, [booking.id]: false }));
    }
  };

  const translateStatus = (status: string) => {
    const statusNames: Record<string, string> = {
      'pending': 'Pendente',
      'confirmed': 'Confirmado',
      'completed': 'Concluído',
      'cancelled': 'Cancelado'
    };
    
    return statusNames[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  const truncateText = (text: string, length = 20) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (bookings.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Data Viagem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map(booking => (
              <React.Fragment key={booking.id}>
                <BookingRow
                  booking={booking}
                  isCreatingOrder={creatingOrder[booking.id]}
                  onCreateOrder={handleCreateServiceOrder}
                  onStatusChange={handleStatusChange}
                  onViewDetails={handleViewDetails}
                  updatingStatus={updatingStatus}
                  formatDate={formatDate}
                  truncateText={truncateText}
                />
                {errors[booking.id] && (
                  <BookingError error={errors[booking.id]} />
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BookingTable;
