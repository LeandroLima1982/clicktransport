
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle, Calendar, MapPin, Car } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Vehicle } from './VehicleSelection';

interface BookingCompleteProps {
  bookingReference: string;
  selectedVehicle: Vehicle | undefined;
  bookingData: {
    origin: string;
    destination: string;
    date: Date | undefined;
    returnDate: Date | undefined;
    tripType: string;
    passengers: string;
    time?: string;
    returnTime?: string;
    passengerData?: {
      name: string;
      phone: string;
    }[];
  };
  totalPrice: number;
  formatCurrency: (value: number) => string;
  onClose: () => void;
}

const BookingComplete: React.FC<BookingCompleteProps> = ({
  bookingReference,
  selectedVehicle,
  bookingData,
  totalPrice,
  formatCurrency,
  onClose
}) => {
  const navigate = useNavigate();

  const formatDateTime = (date: Date | undefined, time?: string) => {
    if (!date) return '';
    
    const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    const formattedTime = time || format(date, "HH:mm", { locale: ptBR });
    
    return `${formattedDate} às ${formattedTime}`;
  };

  const handleViewBookings = () => {
    onClose(); // Close the booking dialog
    navigate('/bookings'); // Navigate to the user's bookings page
  };

  return (
    <div className="text-center py-6">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-4">
        <CheckCircle className="w-10 h-10" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Reserva Confirmada!</h2>
      <p className="text-gray-500 mb-2">Sua reserva foi confirmada com sucesso.</p>
      <p className="text-amber-600 mb-6">Você será redirecionado para suas reservas em instantes...</p>
      
      <Card className="mx-auto max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <div className="text-lg font-bold">Código de Reserva</div>
            <div className="text-3xl font-mono tracking-wider text-primary my-2">{bookingReference}</div>
            <div className="text-sm text-gray-500">Guarde este código para referência futura</div>
          </div>
          
          <div className="border-t border-b py-4 space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-500 flex items-center"><Car className="w-4 h-4 mr-2" /> Veículo:</span>
              <span className="font-medium">{selectedVehicle?.name}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-500 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-green-500" /> Origem:
              </span>
              <span className="font-medium truncate max-w-[240px]">{bookingData.origin}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-500 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-red-500" /> Destino:
              </span>
              <span className="font-medium truncate max-w-[240px]">{bookingData.destination}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 flex items-center"><Calendar className="w-4 h-4 mr-2" /> Data e hora:</span>
              <span className="font-medium">
                {formatDateTime(bookingData.date, bookingData.time)}
              </span>
            </div>
            {bookingData.returnDate && (
              <div className="flex justify-between">
                <span className="text-gray-500">Retorno:</span>
                <span className="font-medium">{formatDateTime(bookingData.returnDate, bookingData.returnTime)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Total:</span>
              <span className="font-medium text-primary">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <p className="text-sm text-gray-500">
              Um email com os detalhes da sua reserva foi enviado para o seu endereço de email.
            </p>
            <p className="text-sm text-gray-500">
              Nossa equipe entrará em contato para confirmar os detalhes da sua viagem.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={handleViewBookings} className="w-full">
            Ver Minhas Reservas
          </Button>
          <Button onClick={onClose} variant="outline" className="w-full">
            Fechar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BookingComplete;
