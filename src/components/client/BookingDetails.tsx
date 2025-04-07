import React, { useState } from 'react';
import { Booking } from '@/types/booking';
import { ServiceOrder, ServiceOrderStatus } from '@/types/serviceOrder';
import { Button } from '@/components/ui/button';
import { cancelBooking } from '@/services/booking/bookingService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, Calendar, MapPin, Users, Clock, Tag, Phone, Mail, Truck, Car } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Import BookingStatus from types
import { BookingStatus } from '@/types/booking';

const statusLabels: Record<BookingStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  completed: 'Concluída',
  cancelled: 'Cancelada'
};

const orderStatusLabels: Record<ServiceOrderStatus, string> = {
  pending: 'Pendente',
  created: 'Criada',
  assigned: 'Atribuída',
  in_progress: 'Em andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada'
};

// Status colors
const statusColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const orderStatusColors: Record<ServiceOrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  created: 'bg-purple-100 text-purple-800',
  assigned: 'bg-indigo-100 text-indigo-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

interface BookingDetailsProps {
  booking: Booking;
  onBack: () => void;
  onRefresh: () => void;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ booking, onBack, onRefresh }) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCancelBooking = async () => {
    if (!user || !booking) return;
    
    setIsCancelling(true);
    try {
      const result = await cancelBooking(booking.id);
      
      if (result.success) {
        toast({
          title: "Reserva cancelada",
          description: "Sua reserva foi cancelada com sucesso.",
          variant: "default",
        });
        onRefresh();
      } else {
        toast({
          title: "Erro ao cancelar",
          description: "Não foi possível cancelar sua reserva. Por favor, tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Erro ao cancelar",
        description: "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não disponível';
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };
  
  const serviceOrder = booking.service_orders?.[0];
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <Badge className={statusColors[booking.status as BookingStatus] || 'bg-gray-100 text-gray-800'}>
          {statusLabels[booking.status as BookingStatus] || booking.status}
        </Badge>
      </div>
      
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Detalhes da Reserva</span>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-gray-500">Origem</div>
                <div className="text-sm">{booking.origin}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Destino</div>
                <div className="text-sm">{booking.destination}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-gray-500">Data da Viagem</div>
                <div className="text-sm">{formatDate(booking.travel_date)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Código da Reserva</div>
                <div className="text-sm">{booking.reference_code}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Detalhes do Cliente</span>
          </div>
          <div className="grid gap-2">
            <div>
              <div className="text-xs text-gray-500">Nome</div>
              <div className="text-sm">{booking.client_name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Email</div>
              <div className="text-sm">{booking.client_email}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Telefone</div>
              <div className="text-sm">{booking.client_phone}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {serviceOrder && (
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Detalhes da Ordem de Serviço</span>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-500">Status da Ordem</div>
                  <div className="text-sm">
                    <Badge className={orderStatusColors[serviceOrder.status] || 'bg-gray-100 text-gray-800'}>
                      {orderStatusLabels[serviceOrder.status] || serviceOrder.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Data de Recolha</div>
                  <div className="text-sm">{formatDate(serviceOrder.pickup_date)}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-500">Motorista</div>
                  <div className="text-sm">{serviceOrder.driver_id || 'Não atribuído'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Veículo</div>
                  <div className="text-sm">{serviceOrder.vehicle_id || 'Não atribuído'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <AlertDialog>
        <AlertDialogTrigger asChild disabled={!canCancel}>
          <Button variant="destructive" disabled={!canCancel || isCancelling}>
            Cancelar Reserva
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Deseja cancelar sua reserva?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelBooking} disabled={isCancelling}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookingDetails;
