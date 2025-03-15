
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Booking } from '@/types/booking';
import BookingStatus from './BookingStatus';
import ServiceOrderStatus from './ServiceOrderStatus';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Car,
  CreditCard,
  Phone,
  AlertTriangle,
} from 'lucide-react';

interface BookingDetailsProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onCancel: (bookingId: string) => Promise<void>;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({
  booking,
  isOpen,
  onClose,
  onCancel,
}) => {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleCancelBooking = async () => {
    if (window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      setIsCancelling(true);
      try {
        await onCancel(booking.id);
        onClose();
      } catch (error) {
        console.error('Error cancelling booking:', error);
      } finally {
        setIsCancelling(false);
      }
    }
  };

  // Get passenger data from booking
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
  const isRoundTrip = booking.return_date !== null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalhes da Reserva</SheetTitle>
          <SheetDescription>
            Reserva #{booking.reference_code}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <BookingStatus status={booking.status} className="py-1 px-3" />
            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancelBooking}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelando...' : 'Cancelar Reserva'}
              </Button>
            )}
          </div>

          {/* Service Order Status Flow */}
          <ServiceOrderStatus status={booking.status} className="my-6" />

          <div className="space-y-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold flex items-center mb-2">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                Data e Horário
              </h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span>{formatDate(booking.travel_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Horário:</span>
                  <span>{formatTime(booking.travel_date)}</span>
                </div>
                {isRoundTrip && booking.return_date && (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data de retorno:</span>
                      <span>{formatDate(booking.return_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Horário de retorno:</span>
                      <span>{formatTime(booking.return_date)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold flex items-center mb-2">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                Trajeto
              </h3>
              <div className="text-sm space-y-1">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Origem:</span>
                  <span className="font-medium">{booking.origin}</span>
                </div>
                <div className="flex flex-col mt-2">
                  <span className="text-muted-foreground">Destino:</span>
                  <span className="font-medium">{booking.destination}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold flex items-center mb-2">
                <Car className="h-4 w-4 mr-2 text-primary" />
                Veículo
              </h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span>{booking.vehicle_type || "Não especificado"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Passageiros:</span>
                  <span>{booking.passengers}</span>
                </div>
              </div>
            </div>

            {passengerData.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold flex items-center mb-2">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  Passageiros
                </h3>
                <div className="space-y-2">
                  {passengerData.map((passenger: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded p-2">
                      <div className="font-medium">{passenger.name}</div>
                      <a 
                        href={`https://wa.me/${passenger.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs text-green-600 hover:text-green-700 transition-colors"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        {passenger.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold flex items-center mb-2">
                <CreditCard className="h-4 w-4 mr-2 text-primary" />
                Pagamento
              </h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Valor Total:</span>
                  <span className="text-primary">{formatCurrency(booking.total_price || 0)}</span>
                </div>
                {booking.status === 'pending' && (
                  <div className="flex items-center mt-2 text-amber-600 text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span>Aguardando pagamento</span>
                  </div>
                )}
              </div>
            </div>

            {booking.additional_notes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Observações</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">{booking.additional_notes}</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BookingDetails;
