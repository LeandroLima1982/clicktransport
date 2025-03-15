import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Car, 
  CreditCard,
  X,
  User,
  Users,
  Share2,
  Phone
} from 'lucide-react';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import BookingStatus from './BookingStatus';
import { Booking } from '@/types/booking';
import { shareViaWhatsApp, formatBookingShareMessage, vibrate, feedbackPatterns } from '@/services/notifications/notificationService';
import { useIsMobile } from '@/hooks/use-mobile';

interface BookingDetailsProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onCancel: (bookingId: string) => Promise<boolean>;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({
  booking,
  isOpen,
  onClose,
  onCancel
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const isMobile = useIsMobile();
  
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
  
  const handleCancel = async () => {
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return;
    }
    
    setIsCancelling(true);
    try {
      const success = await onCancel(booking.id);
      if (success) {
        onClose();
      }
    } finally {
      setIsCancelling(false);
    }
  };
  
  let passengerData = [];
  try {
    if (booking.passenger_data) {
      passengerData = typeof booking.passenger_data === 'string' 
        ? JSON.parse(booking.passenger_data) 
        : booking.passenger_data;
    }
  } catch (e) {
    console.error('Error parsing passenger data:', e);
  }
  
  const totalPrice = booking.total_price || 0;
  const isRoundTrip = booking.return_date !== null;
  const oneWayPrice = isRoundTrip ? totalPrice / 2 : totalPrice;
  const returnPrice = isRoundTrip ? totalPrice / 2 : 0;
  
  const handleShareViaWhatsApp = () => {
    vibrate(feedbackPatterns.success);
    
    const bookingData = {
      origin: booking.origin,
      destination: booking.destination,
      date: formatDate(booking.travel_date),
      time: formatTime(booking.travel_date),
      tripType: isRoundTrip ? 'roundtrip' : 'oneway',
      passengerData
    };
    
    const message = formatBookingShareMessage(bookingData, {
      simplified: true,
      referenceCode: booking.reference_code,
      includePassengers: true
    });
    
    shareViaWhatsApp(message);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl">Detalhes da Reserva</SheetTitle>
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </SheetClose>
        </SheetHeader>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">Código</h3>
              <BookingStatus status={booking.status} />
            </div>
            <p className="text-lg font-mono">{booking.reference_code}</p>
            <p className="text-sm text-muted-foreground">
              Reserva feita em {formatDate(booking.booking_date)}
            </p>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShareViaWhatsApp}
              className="mt-2 w-full flex items-center justify-center"
            >
              <Phone className="h-4 w-4 mr-2 text-green-600" />
              <span>Compartilhar via WhatsApp</span>
            </Button>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Data e Hora
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Ida</p>
                <p className="font-medium">{formatDate(booking.travel_date)}</p>
                <p className="text-sm">{formatTime(booking.travel_date)}</p>
              </div>
              
              {booking.return_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Volta</p>
                  <p className="font-medium">{formatDate(booking.return_date)}</p>
                  <p className="text-sm">{formatTime(booking.return_date)}</p>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Trajeto
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Origem</p>
                <p>{booking.origin}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Destino</p>
                <p>{booking.destination}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <Car className="h-4 w-4 mr-2" />
              Detalhes do Serviço
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Veículo</p>
                <p>{booking.vehicle_type || "Não especificado"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Passageiros</p>
                <p>{booking.passengers || passengerData.length || 1}</p>
              </div>
            </div>
          </div>
          
          {passengerData && passengerData.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Passageiros
                </h3>
                <div className="space-y-2">
                  {passengerData.map((passenger: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <div className="font-medium">{passenger.name}</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-3 w-3 mr-1 text-green-600" />
                        {passenger.phone}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {booking.additional_notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Observações</h3>
                <p className="text-sm">{booking.additional_notes}</p>
              </div>
            </>
          )}
          
          <Separator />
          
          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Pagamento
            </h3>
            <div className="space-y-2">
              {isRoundTrip ? (
                <>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Valor da Ida</p>
                    <p className="font-medium">{formatCurrency(oneWayPrice)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Valor da Volta</p>
                    <p className="font-medium">{formatCurrency(returnPrice)}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 mt-1 border-t">
                    <p className="font-semibold">Total</p>
                    <p className="text-lg font-semibold text-primary">
                      {formatCurrency(booking.total_price)}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Valor Total</p>
                  <p className="text-lg font-semibold text-primary">
                    {formatCurrency(booking.total_price)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <SheetFooter className="mt-6">
          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              disabled={isCancelling}
              className="w-full"
            >
              {isCancelling ? "Cancelando..." : "Cancelar Reserva"}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default BookingDetails;
