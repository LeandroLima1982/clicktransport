import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MapPin, MoreHorizontal, AlertTriangle, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/booking';
import { createServiceOrderFromBooking } from '@/services/booking/serviceOrderService';

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
  const [creatingOrder, setCreatingOrder] = useState(false);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    // In the future, this could open a modal with detailed information
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
    setCreatingOrder(true);
    try {
      if (!booking.company_id) {
        toast.warning("Não é possível criar ordem sem empresa atribuída");
        return;
      }
      
      console.log('Creating service order from booking:', booking.id);
      
      // Find company name for this booking
      const companyName = booking.company_name || null;
      
      // Create a booking with the company_name property populated
      const bookingWithCompany = {
        ...booking,
        company_name: companyName
      };
      
      console.log('Creating service order with booking data:', bookingWithCompany);
      
      const { serviceOrder, error } = await createServiceOrderFromBooking(bookingWithCompany);
      
      if (error) {
        console.error('Error creating service order:', error);
        toast.error("Erro ao criar ordem de serviço", {
          description: String(error)
        });
        return;
      }
      
      console.log('Service order created successfully:', serviceOrder);
      
      toast.success("Ordem de serviço criada com sucesso!");
      onRefreshData();
    } catch (error) {
      console.error('Exception creating service order:', error);
      toast.error("Erro ao criar ordem de serviço");
    } finally {
      setCreatingOrder(false);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmado</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const truncateText = (text: string, length = 20) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <p>Carregando reservas...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex justify-center items-center flex-col h-60">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-muted-foreground">Nenhuma reserva encontrada</p>
      </div>
    );
  }

  return (
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
            <TableRow key={booking.id}>
              <TableCell className="font-medium">{booking.reference_code}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                  {truncateText(booking.origin)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                  {truncateText(booking.destination)}
                </div>
              </TableCell>
              <TableCell>{formatDate(booking.travel_date)}</TableCell>
              <TableCell>{getStatusBadge(booking.status)}</TableCell>
              <TableCell>
                {booking.has_service_order ? (
                  <Badge className="bg-green-100 text-green-800">Criada</Badge>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCreateServiceOrder(booking)}
                    disabled={creatingOrder || !booking.company_id}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Criar
                  </Button>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                    {booking.status !== 'pending' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(booking, 'pending')}
                        disabled={updatingStatus}
                      >
                        <Badge className="bg-yellow-100 text-yellow-800 mr-2">Pendente</Badge>
                      </DropdownMenuItem>
                    )}
                    {booking.status !== 'confirmed' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(booking, 'confirmed')}
                        disabled={updatingStatus}
                      >
                        <Badge className="bg-blue-100 text-blue-800 mr-2">Confirmado</Badge>
                      </DropdownMenuItem>
                    )}
                    {booking.status !== 'completed' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(booking, 'completed')}
                        disabled={updatingStatus}
                      >
                        <Badge className="bg-green-100 text-green-800 mr-2">Concluído</Badge>
                      </DropdownMenuItem>
                    )}
                    {booking.status !== 'cancelled' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(booking, 'cancelled')}
                        disabled={updatingStatus}
                      >
                        <Badge className="bg-red-100 text-red-800 mr-2">Cancelado</Badge>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BookingTable;
