
import React, { useEffect, useState } from 'react';
import { Check, CalendarCheck, Copy, Download, Users, Phone, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Vehicle } from './VehicleSelection';
import { toast } from 'sonner';
import { shareViaWhatsApp, formatBookingShareMessage } from '@/services/notifications/notificationService';
import { calculateRoute } from '@/utils/routeUtils';

interface BookingCompleteProps {
  bookingReference: string;
  selectedVehicle: Vehicle | undefined;
  bookingData: {
    origin: string;
    destination: string;
    date: Date | undefined;
    tripType: string;
    time?: string;
    returnDate?: Date;
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
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);
  
  useEffect(() => {
    // Calculate route and duration when component mounts
    const fetchRouteData = async () => {
      if (bookingData.origin && bookingData.destination) {
        try {
          const routeInfo = await calculateRoute(bookingData.origin, bookingData.destination);
          if (routeInfo) {
            setEstimatedDuration(routeInfo.duration);
          }
        } catch (error) {
          console.error('Error calculating route:', error);
        }
      }
    };
    
    fetchRouteData();
  }, [bookingData.origin, bookingData.destination]);
  
  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };
  
  const calculateArrivalTime = (date: Date | undefined, time: string | undefined, durationMinutes: number | null) => {
    if (!date || !time || !durationMinutes) return '';
    
    try {
      // Parse the time string and create a new date with hours and minutes
      const [hours, minutes] = time.split(':').map(Number);
      const departure = new Date(date);
      departure.setHours(hours, minutes);
      
      // Add duration to get arrival time
      const arrival = addMinutes(departure, durationMinutes);
      return format(arrival, 'HH:mm', { locale: ptBR });
    } catch (e) {
      return '';
    }
  };
  
  const formatTravelTime = (minutes: number | null) => {
    if (!minutes) return '';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}min`;
    }
  };

  const oneWayPrice = bookingData.tripType === 'roundtrip' ? totalPrice / 2 : totalPrice;
  const returnPrice = bookingData.tripType === 'roundtrip' ? totalPrice / 2 : 0;
  
  const departureTime = bookingData.time || '';
  const returnDepartureTime = bookingData.returnTime || '';
  
  const arrivalTime = calculateArrivalTime(bookingData.date, departureTime, estimatedDuration);
  const returnArrivalTime = calculateArrivalTime(bookingData.returnDate, returnDepartureTime, estimatedDuration);

  const handleCopyReference = () => {
    navigator.clipboard.writeText(bookingReference);
    toast.success('Código de reserva copiado para a área de transferência');
  };
  
  const handleShareViaWhatsApp = () => {
    const creationDate = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    
    const message = formatBookingShareMessage({
      origin: bookingData.origin,
      destination: bookingData.destination,
      date: bookingData.date ? formatDate(bookingData.date) : '',
      time: departureTime,
      arrivalTime: arrivalTime,
      duration: estimatedDuration,
      tripType: bookingData.tripType,
      passengerData: bookingData.passengerData,
      creationDate: creationDate,
      returnDate: bookingData.returnDate ? formatDate(bookingData.returnDate) : '',
      returnTime: returnDepartureTime,
      returnArrivalTime: returnArrivalTime
    }, {
      simplified: true,
      referenceCode: bookingReference,
      includePassengers: true,
      includePrice: true,
      totalPrice: totalPrice
    });
    
    shareViaWhatsApp(message);
  };

  return (
    <div className="space-y-6 max-w-md mx-auto text-center">
      <div className="flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">Reserva Confirmada!</h2>
        <p className="text-gray-600 mt-2">
          Sua viagem foi reservada com sucesso. Agradecemos sua preferência.
        </p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-500 mb-1">Código da reserva</div>
        <div className="flex items-center justify-center">
          <span className="text-xl font-bold">{bookingReference}</span>
          <button
            onClick={handleCopyReference}
            className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
            aria-label="Copiar código de reserva"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Criada em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </div>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center"
        onClick={handleShareViaWhatsApp}
      >
        <Phone className="h-4 w-4 mr-2 text-green-600" />
        Compartilhar via WhatsApp
      </Button>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Veículo:</span>
          <span className="font-medium">{selectedVehicle?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Origem:</span>
          <span className="font-medium">{bookingData.origin}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Destino:</span>
          <span className="font-medium">{bookingData.destination}</span>
        </div>
        
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Data de ida:</span>
            <span className="font-medium">{formatDate(bookingData.date)}</span>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-600">Horários:</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {departureTime}
              </span>
              {arrivalTime && (
                <>
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {arrivalTime}
                  </span>
                </>
              )}
            </div>
          </div>
          
          {estimatedDuration && (
            <div className="flex justify-between mt-1">
              <span className="text-gray-600">Duração est.:</span>
              <span>{formatTravelTime(estimatedDuration)}</span>
            </div>
          )}
        </div>
        
        {bookingData.tripType === 'roundtrip' && bookingData.returnDate && (
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Data de volta:</span>
              <span className="font-medium">{formatDate(bookingData.returnDate)}</span>
            </div>
            
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-600">Horários:</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {returnDepartureTime}
                </span>
                {returnArrivalTime && (
                  <>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {returnArrivalTime}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {estimatedDuration && (
              <div className="flex justify-between mt-1">
                <span className="text-gray-600">Duração est.:</span>
                <span>{formatTravelTime(estimatedDuration)}</span>
              </div>
            )}
          </div>
        )}
        
        {bookingData.passengerData && bookingData.passengerData.length > 0 && (
          <div className="text-left border rounded p-3 mt-2">
            <div className="flex items-center mb-2">
              <Users className="h-4 w-4 mr-1" />
              <span className="font-medium">Passageiros:</span>
            </div>
            <div className="space-y-2 pl-5">
              {bookingData.passengerData.map((passenger, index) => (
                <div key={index} className="text-sm">
                  <div>{passenger.name}</div>
                  <a 
                    href={`https://wa.me/${passenger.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-500 hover:text-green-600 transition-colors"
                  >
                    <Phone className="h-3 w-3 mr-1 text-green-600" />
                    {passenger.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="border-t pt-3 mt-3">
          <div className="text-gray-600 font-medium text-left mb-2">Detalhamento do valor:</div>
          <div className="flex justify-between text-sm">
            <span>Valor da ida:</span>
            <span>{formatCurrency(oneWayPrice)}</span>
          </div>
          
          {bookingData.tripType === 'roundtrip' && (
            <div className="flex justify-between text-sm">
              <span>Valor da volta:</span>
              <span>{formatCurrency(returnPrice)}</span>
            </div>
          )}
          
          <div className="flex justify-between mt-2 pt-2 border-t font-bold text-primary">
            <span>Valor total:</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
        <CalendarCheck className="h-5 w-5 mx-auto mb-2" />
        <p>
          Uma confirmação foi enviada para seu email com todos os detalhes da reserva.
          Você pode acompanhar o status da sua viagem no seu painel de reservas.
        </p>
      </div>
      
      <div className="pt-4 space-y-3">
        <Button variant="outline" className="w-full" onClick={onClose}>
          Concluir
        </Button>
        
        <Button variant="ghost" className="w-full flex items-center justify-center" disabled>
          <Download className="h-4 w-4 mr-2" />
          Baixar comprovante
        </Button>
      </div>
    </div>
  );
};

export default BookingComplete;
