
import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Clock,
  MapPin,
  Calendar,
  Users,
  Car,
  CheckCircle,
  AlertTriangle,
  X,
  Phone,
  Share2
} from 'lucide-react';
import { Booking } from '@/types/booking';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from '@/hooks/use-mobile';
import { shareViaWhatsApp, formatBookingShareMessage } from '@/services/notifications/notificationService';

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
  const [isCancelling, setIsCancelling] = React.useState(false);
  const isMobile = useIsMobile();
  
  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancel(booking.id);
      onClose();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setIsCancelling(false);
    }
  };
  
  // Improved date formatting function with error handling
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch (e) {
      console.error('Error formatting date:', e, dateString);
      return dateString;
    }
  };
  
  // Improved time formatting function with error handling
  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "HH:mm", { locale: ptBR });
    } catch (e) {
      console.error('Error formatting time:', e, dateString);
      return "--:--";
    }
  };
  
  const formatCurrency = (value: number = 0) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Check if booking has passenger data
  const getPassengerData = () => {
    if (booking.passenger_data) {
      try {
        return typeof booking.passenger_data === 'string' 
          ? JSON.parse(booking.passenger_data) 
          : booking.passenger_data;
      } catch (e) {
        return [];
      }
    }
    return [];
  };
  
  const passengerData = getPassengerData();
  
  // Format creation date and time
  const formatCreationDateTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      const formattedDate = format(date, "dd/MM/yyyy", { locale: ptBR });
      const formattedTime = format(date, "HH:mm", { locale: ptBR });
      return { date: formattedDate, time: formattedTime };
    } catch (e) {
      console.error('Error formatting creation date time:', e, dateString);
      return { date: "", time: "" };
    }
  };
  
  const creationDateTime = formatCreationDateTime(booking.booking_date);
  
  // Calculate price breakdown
  const getPriceInfo = () => {
    const totalPrice = booking.total_price || 0;
    const isRoundTrip = booking.return_date !== null;
    const oneWayPrice = isRoundTrip ? totalPrice / 2 : totalPrice;
    const returnPrice = isRoundTrip ? totalPrice / 2 : 0;
    
    return { totalPrice, oneWayPrice, returnPrice, isRoundTrip };
  };
  
  const { totalPrice, oneWayPrice, returnPrice, isRoundTrip } = getPriceInfo();
  
  // Handle share via WhatsApp
  const handleShareViaWhatsApp = () => {
    const shareData = {
      origin: booking.origin,
      destination: booking.destination,
      date: booking.travel_date,
      returnDate: booking.return_date,
      tripType: isRoundTrip ? 'roundtrip' : 'oneway',
      creationDate: `${creationDateTime.date} ${creationDateTime.time}`,
      passengerData: passengerData,
    };
    
    const message = formatBookingShareMessage(shareData, {
      simplified: true,
      referenceCode: booking.reference_code,
      totalPrice: totalPrice,
      includePassengers: true,
      includePrice: true
    });
    
    shareViaWhatsApp(message);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpen => !onOpen && onClose()}>
      <SheetContent side={isMobile ? "bottom" : "right"} className={isMobile ? "h-[90vh] max-h-[90vh] rounded-t-xl overflow-hidden" : "max-w-md overflow-hidden"}>
        {isMobile && <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />}
        
        <SheetHeader className="mb-4 sticky top-0 bg-background pb-2 z-10">
          <SheetTitle className="flex items-center justify-between">
            <span>Detalhes da Reserva</span>
            <BookingStatus status={booking.status} />
          </SheetTitle>
        </SheetHeader>
        
        {/* Added overflow-y-auto to make content scrollable, max-h-full to ensure it stays within container */}
        <div className="space-y-6 overflow-y-auto pb-20" style={{ maxHeight: 'calc(100% - 130px)' }}>
          <div>
            <div className="text-lg font-semibold mb-1">
              Código: {booking.reference_code}
            </div>
            <div className="text-sm text-muted-foreground">
              Reserva em {creationDateTime.date} às {creationDateTime.time}
            </div>
          </div>
          
          <div className="flex flex-col space-y-4">
            <div className="bg-secondary/50 p-3 rounded-lg">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4 mr-2" />
                Data da Viagem
              </div>
              <div className="font-medium">{formatDate(booking.travel_date)}</div>
              <div className="flex items-center text-sm mt-1">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                {formatTime(booking.travel_date)}
              </div>
              
              {isRoundTrip && booking.return_date && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Data de Retorno
                  </div>
                  <div className="font-medium">{formatDate(booking.return_date)}</div>
                  <div className="flex items-center text-sm mt-1">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatTime(booking.return_date)}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-secondary/50 p-3 rounded-lg">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <MapPin className="h-4 w-4 mr-2" />
                Origem
              </div>
              <div className="font-medium">{booking.origin}</div>
              
              <div className="mt-2 pt-2 border-t border-border/50">
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  Destino
                </div>
                <div className="font-medium">{booking.destination}</div>
              </div>
            </div>
            
            <div className="bg-secondary/50 p-3 rounded-lg">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Car className="h-4 w-4 mr-2" />
                Veículo
              </div>
              <div className="font-medium">{booking.vehicle_type || "Não especificado"}</div>
              
              <div className="mt-2 pt-2 border-t border-border/50">
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <Users className="h-4 w-4 mr-2" />
                  Passageiros
                </div>
                <div className="font-medium">{booking.passengers} pessoa(s)</div>
              </div>
            </div>
            
            {passengerData.length > 0 && (
              <div className="bg-secondary/50 p-3 rounded-lg">
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Users className="h-4 w-4 mr-2" />
                  Informações dos Passageiros
                </div>
                <div className="space-y-3">
                  {passengerData.map((passenger: any, index: number) => (
                    <div key={index} className="bg-background p-2 rounded-md">
                      <div className="font-medium">{passenger.name}</div>
                      <a 
                        href={`https://wa.me/${passenger.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs text-green-600 hover:text-green-700 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        {passenger.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-secondary/50 p-3 rounded-lg">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <div>Resumo de Valores</div>
              </div>
              
              {isRoundTrip ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Valor da ida:</span>
                    <span>{formatCurrency(oneWayPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Valor da volta:</span>
                    <span>{formatCurrency(returnPrice)}</span>
                  </div>
                </>
              ) : null}
              
              <div className="flex justify-between font-medium pt-2 mt-2 border-t border-border/50">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={handleShareViaWhatsApp}
              >
                <Share2 className="h-4 w-4" />
                <span>Compartilhar via WhatsApp</span>
              </Button>
              
              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1 gap-2">
                      <X className="h-4 w-4" />
                      <span>Cancelar Reserva</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancelar Reserva</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Não, manter reserva</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancel}
                        disabled={isCancelling}
                        className="bg-destructive text-destructive-foreground"
                      >
                        {isCancelling ? 'Cancelando...' : 'Sim, cancelar reserva'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
        
        <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
          <Button onClick={onClose} className="w-full">Fechar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default BookingDetails;
