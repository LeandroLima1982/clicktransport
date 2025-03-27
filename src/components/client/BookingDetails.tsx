
import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Booking } from '@/types/booking';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  Users,
  CreditCard,
  Trash2,
  AlertCircle,
  CheckCircle2,
  CircleDot
} from 'lucide-react';
import BookingStatus from './BookingStatus';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ServiceOrderStatus from './ServiceOrderStatus';

interface BookingDetailsProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onCancel: (id: string) => Promise<void>;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({
  booking,
  isOpen,
  onClose,
  onCancel
}) => {
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };
  
  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "HH:mm", { locale: ptBR });
    } catch (e) {
      return "";
    }
  };
  
  const formatCurrency = (value: number = 0) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const handleCancelBooking = async () => {
    setIsCancelling(true);
    try {
      await onCancel(booking.id);
      setCancelDialogOpen(false);
    } finally {
      setIsCancelling(false);
    }
  };
  
  const getBookingProgress = () => {
    if (booking.status === 'cancelled') {
      return -1; // Special case for cancelled
    }
    
    if (booking.status === 'completed') {
      return 100; // Completed
    }
    
    const now = new Date();
    const bookingDate = parseISO(booking.booking_date);
    const travelDate = parseISO(booking.travel_date);
    
    const totalDuration = travelDate.getTime() - bookingDate.getTime();
    const elapsed = now.getTime() - bookingDate.getTime();
    
    const progress = Math.min(Math.floor((elapsed / totalDuration) * 100), 99);
    return Math.max(progress, 5); // At least 5% progress
  };
  
  // Format for UI clarity
  const getBookingDate = () => {
    try {
      const date = parseISO(booking.booking_date);
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      return booking.booking_date;
    }
  };
  
  // Determine if we can cancel (only pending or confirmed and not in the past)
  const canCancel = () => {
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return false;
    }
    
    try {
      const travelDate = parseISO(booking.travel_date);
      const now = new Date();
      return travelDate > now;
    } catch (e) {
      return false;
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-xl overflow-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center justify-between">
              <span>Detalhes da Reserva</span>
              <BookingStatus status={booking.status} />
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <div className="text-sm text-muted-foreground">Código da Reserva</div>
                <div className="font-medium">{booking.reference_code}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Data da Reserva</div>
                <div className="font-medium">{getBookingDate()}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-3">Detalhes da Viagem</h3>
              
              <div className="space-y-4 bg-gray-50 p-3 rounded-md">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Data</div>
                    <div className="font-medium">{formatDate(booking.travel_date)}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Horário</div>
                    <div className="font-medium">{formatTime(booking.travel_date)}</div>
                  </div>
                </div>
                
                {booking.return_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Data de Retorno</div>
                      <div className="font-medium">{formatDate(booking.return_date)}</div>
                      {formatTime(booking.return_date) && (
                        <div className="text-sm">{formatTime(booking.return_date)}</div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Origem</div>
                    <div className="font-medium">{booking.origin}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Destino</div>
                    <div className="font-medium">{booking.destination}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-3">Informações Adicionais</h3>
              
              <div className="space-y-4 bg-gray-50 p-3 rounded-md">
                <div className="flex items-start gap-3">
                  <Car className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Veículo</div>
                    <div className="font-medium">{booking.vehicle_type || "Veículo padrão"}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Passageiros</div>
                    <div className="font-medium">{booking.passengers}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Valor Total</div>
                    <div className="font-medium">{formatCurrency(booking.total_price)}</div>
                  </div>
                </div>
                
                {booking.additional_notes && (
                  <div className="flex items-start gap-3">
                    <CircleDot className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Observações</div>
                      <div className="font-medium">{booking.additional_notes}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-3">Status do Serviço</h3>
              <ServiceOrderStatus booking={booking} />
            </div>
            
            <div className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline"
                onClick={() => onClose()}
              >
                Fechar
              </Button>
              
              {canCancel() && (
                <Button 
                  variant="destructive"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancelar Reserva
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Reserva</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta reserva? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCancelBooking();
              }}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? 'Cancelando...' : 'Sim, Cancelar Reserva'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BookingDetails;
