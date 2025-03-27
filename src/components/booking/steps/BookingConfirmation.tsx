
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, CreditCard, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Vehicle } from './VehicleSelection';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

interface BookingConfirmationProps {
  selectedVehicle: Vehicle | undefined;
  selectedPaymentMethod: string | null;
  paymentMethods: PaymentMethod[];
  bookingData: {
    origin: string;
    destination: string;
    date: Date | undefined;
    returnDate: Date | undefined;
    tripType: string;
    passengers: string;
    time?: string;
    returnTime?: string;
  };
  totalPrice: number;
  formatCurrency: (value: number) => string;
  estimatedDistance: number;
  estimatedTime: number;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  selectedVehicle,
  selectedPaymentMethod,
  paymentMethods,
  bookingData,
  totalPrice,
  formatCurrency,
  estimatedDistance,
  estimatedTime
}) => {
  const getPaymentMethodName = (): string => {
    const method = paymentMethods.find(m => m.id === selectedPaymentMethod);
    return method ? method.name : 'Não selecionado';
  };

  const formatEstimatedTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 
      ? `${hours}h ${mins > 0 ? `${mins}min` : ''}`
      : `${mins}min`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="flex flex-col items-center mb-3">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold">Confirmar Reserva</h3>
          <p className="text-sm text-gray-500">
            Verifique os detalhes abaixo e confirme sua reserva
          </p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start">
            <MapPin className="mt-0.5 h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Origem</div>
              <div className="text-sm font-medium">{bookingData.origin}</div>
              
              <div className="text-xs text-gray-500 pt-2">Destino</div>
              <div className="text-sm font-medium">{bookingData.destination}</div>
              
              <div className="flex items-center pt-1">
                <div className="text-xs text-gray-500">
                  {estimatedDistance} km • {formatEstimatedTime(estimatedTime)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t my-2"></div>
          
          <div className="flex items-start">
            <Calendar className="mt-0.5 h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Data e hora de ida</div>
              <div className="text-sm font-medium">
                {bookingData.date 
                  ? format(bookingData.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : 'Não especificado'
                }
                {bookingData.time ? ` às ${bookingData.time}` : ''}
              </div>
              
              {bookingData.tripType === 'roundtrip' && (
                <>
                  <div className="text-xs text-gray-500 pt-2">Data e hora de volta</div>
                  <div className="text-sm font-medium">
                    {bookingData.returnDate 
                      ? format(bookingData.returnDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : 'Não especificado'
                    }
                    {bookingData.returnTime ? ` às ${bookingData.returnTime}` : ''}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="border-t my-2"></div>
          
          <div className="flex items-start">
            <CreditCard className="mt-0.5 h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="text-xs text-gray-500">Resumo</div>
              
              <div className="flex justify-between">
                <div className="text-sm">Veículo:</div>
                <div className="text-sm font-medium">{selectedVehicle?.name}</div>
              </div>
              
              <div className="flex justify-between">
                <div className="text-sm">Passageiros:</div>
                <div className="text-sm font-medium">{bookingData.passengers}</div>
              </div>
              
              <div className="flex justify-between">
                <div className="text-sm">Tipo de viagem:</div>
                <div className="text-sm font-medium">
                  {bookingData.tripType === 'oneway' ? 'Somente ida' : 'Ida e volta'}
                </div>
              </div>
              
              <div className="flex justify-between">
                <div className="text-sm">Forma de pagamento:</div>
                <div className="text-sm font-medium">{getPaymentMethodName()}</div>
              </div>
              
              <div className="flex justify-between pt-3">
                <div className="text-base font-bold">Total:</div>
                <div className="text-base font-bold text-primary">{formatCurrency(totalPrice)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-sm text-gray-500 space-y-2">
        <p>
          Ao confirmar a reserva, você concorda com os Termos e Condições e Política de Privacidade.
        </p>
      </div>
    </div>
  );
};

export default BookingConfirmation;
