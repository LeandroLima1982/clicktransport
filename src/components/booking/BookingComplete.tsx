
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, Phone, MapPin } from 'lucide-react';
import { Vehicle } from './steps/VehicleSelection';
import { shareViaWhatsApp, formatBookingShareMessage } from '@/services/notifications/notificationService';

interface BookingCompleteProps {
  bookingReference: string;
  selectedVehicle: Vehicle | undefined;
  bookingData: {
    date: Date | undefined;
    tripType?: string;
    origin?: string;
    destination?: string;
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
  const oneWayPrice = bookingData.tripType === 'roundtrip' ? totalPrice / 2 : totalPrice;
  const returnPrice = bookingData.tripType === 'roundtrip' ? totalPrice / 2 : 0;

  const handleShareViaWhatsApp = () => {
    const shareData = {
      origin: bookingData.origin || '',
      destination: bookingData.destination || '',
      date: bookingData.date,
      tripType: bookingData.tripType,
      time: bookingData.time,
      returnTime: bookingData.returnTime,
      passengerData: bookingData.passengerData,
      creationDate: new Date().toLocaleDateString('pt-BR'),
      formattedTime: format(new Date(), 'HH:mm')
    };
    
    const message = formatBookingShareMessage(shareData, {
      simplified: true,
      referenceCode: bookingReference,
      totalPrice: totalPrice
    });
    
    shareViaWhatsApp(message);
  };

  const formatDateTime = (date: Date | undefined, time?: string) => {
    if (!date) return 'Não especificado';
    
    const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    const formattedTime = time || '00:00';
    
    return `${formattedDate} às ${formattedTime}`;
  };

  return (
    <div className="text-center py-6">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-4">
        <CheckCircle className="w-10 h-10" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Reserva Confirmada!</h2>
      <p className="text-gray-500 mb-6">Sua reserva foi confirmada com sucesso.</p>
      
      <Card className="mx-auto max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <div className="text-lg font-bold">Código de Reserva</div>
            <div className="text-3xl font-mono tracking-wider text-primary my-2">{bookingReference}</div>
            <div className="text-sm text-gray-500">Guarde este código para referência futura</div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShareViaWhatsApp}
            className="mb-4 w-full flex items-center justify-center"
          >
            <Phone className="h-4 w-4 mr-2 text-green-600" />
            <span>Compartilhar via WhatsApp</span>
          </Button>
          
          <div className="border-t border-b py-4 space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-500">Veículo:</span>
              <span className="font-medium">{selectedVehicle?.name}</span>
            </div>
            
            {bookingData.origin && bookingData.destination && (
              <>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-green-500" />Origem:
                  </span>
                  <span className="font-medium text-right max-w-[240px]">{bookingData.origin}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-red-500" />Destino:
                  </span>
                  <span className="font-medium text-right max-w-[240px]">{bookingData.destination}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-500">Data e hora:</span>
              <span className="font-medium">
                {formatDateTime(bookingData.date, bookingData.time)}
              </span>
            </div>
            
            {bookingData.tripType === 'roundtrip' && (
              <div className="flex justify-between">
                <span className="text-gray-500">Retorno:</span>
                <span className="font-medium">
                  {formatDateTime(bookingData.date, bookingData.returnTime)}
                </span>
              </div>
            )}
            
            {bookingData.passengerData && bookingData.passengerData.length > 0 && (
              <div className="mt-2">
                <div className="text-gray-500 mb-1 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Passageiros:</span>
                </div>
                <div className="ml-5 space-y-2">
                  {bookingData.passengerData.map((passenger, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">{passenger.name}</div>
                      <div className="flex items-center text-gray-500">
                        <Phone className="h-3 w-3 mr-1 text-green-600" />
                        {passenger.phone}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-2 mt-2 border-t">
              <div className="text-gray-500 mb-1">Resumo do valor:</div>
              {bookingData.tripType === 'roundtrip' ? (
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
              <div className="flex justify-between font-bold text-primary mt-1">
                <span>Total:</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
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
        <CardFooter>
          <Button onClick={onClose} className="w-full">
            Concluir
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BookingComplete;
