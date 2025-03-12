
import React from 'react';
import { Check, Calendar, MapPin, CreditCard, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Vehicle } from './VehicleSelection';

interface BookingConfirmationProps {
  selectedVehicle: Vehicle | undefined;
  selectedPaymentMethod: string | null;
  paymentMethods: {
    id: string;
    name: string;
  }[];
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
  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const selectedPaymentMethodName = paymentMethods.find(m => m.id === selectedPaymentMethod)?.name || '';

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold">Confirme sua reserva</h3>
        <p className="text-gray-500 mt-1">Revise os detalhes antes de confirmar</p>
      </div>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-gray-500" />
            Detalhes da viagem
          </h4>
          
          <div className="space-y-3 pl-7">
            <div>
              <div className="text-sm text-gray-500">Origem</div>
              <div className="font-medium">{bookingData.origin}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Destino</div>
              <div className="font-medium">{bookingData.destination}</div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div>
                <div className="text-sm text-gray-500">Distância</div>
                <div>{estimatedDistance} km</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Tempo estimado</div>
                <div>{formatTime(estimatedTime)}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-500" />
            Datas e horários
          </h4>
          
          <div className="space-y-3 pl-7">
            <div>
              <div className="text-sm text-gray-500">Data de ida</div>
              <div className="font-medium">{formatDate(bookingData.date)}</div>
              {bookingData.time && (
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  <span className="text-sm text-gray-500">{bookingData.time}</span>
                </div>
              )}
            </div>
            
            {bookingData.tripType === 'roundtrip' && (
              <div>
                <div className="text-sm text-gray-500">Data de retorno</div>
                <div className="font-medium">{formatDate(bookingData.returnDate)}</div>
                {bookingData.returnTime && (
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="text-sm text-gray-500">{bookingData.returnTime}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center">
            <User className="h-5 w-5 mr-2 text-gray-500" />
            Passageiros e veículo
          </h4>
          
          <div className="space-y-3 pl-7">
            <div>
              <div className="text-sm text-gray-500">Número de passageiros</div>
              <div className="font-medium">{bookingData.passengers}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Veículo</div>
              <div className="font-medium">{selectedVehicle?.name}</div>
              <div className="text-sm text-gray-500">{selectedVehicle?.description}</div>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
            Pagamento
          </h4>
          
          <div className="space-y-3 pl-7">
            <div>
              <div className="text-sm text-gray-500">Método de pagamento</div>
              <div className="font-medium">{selectedPaymentMethodName}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Valor total</div>
              <div className="font-medium text-primary text-xl">{formatCurrency(totalPrice)}</div>
              {bookingData.tripType === 'roundtrip' && (
                <div className="text-xs text-gray-500">*Inclui ida e volta</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t pt-4 mt-4 text-sm text-gray-500">
        Ao confirmar sua reserva, você concorda com nossos Termos de Serviço e Política de Privacidade.
      </div>
    </div>
  );
};

export default BookingConfirmation;
