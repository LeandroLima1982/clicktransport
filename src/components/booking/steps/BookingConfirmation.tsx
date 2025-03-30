
import React from 'react';
import { Check, Calendar, MapPin, CreditCard, User, Clock, Users } from 'lucide-react';
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
    passengerData?: {
      name: string;
      phone: string;
    }[];
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

  const oneWayPrice = bookingData.tripType === 'roundtrip' ? totalPrice / 2 : totalPrice;
  const returnPrice = bookingData.tripType === 'roundtrip' ? totalPrice / 2 : 0;

  const selectedPaymentMethodName = paymentMethods.find(m => m.id === selectedPaymentMethod)?.name || '';

  return (
    <div className="space-y-6 text-white">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-400/20 rounded-full mb-4">
          <Check className="h-8 w-8 text-amber-400" />
        </div>
        <h3 className="text-xl font-semibold">Confirme sua reserva</h3>
        <p className="text-gray-300 mt-1">Revise os detalhes antes de confirmar</p>
      </div>
      
      <div className="space-y-6">
        <div className="border border-white/10 rounded-lg p-4 bg-white/5">
          <h4 className="font-medium mb-3 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-amber-300" />
            Detalhes da viagem
          </h4>
          
          <div className="space-y-3 pl-7">
            <div>
              <div className="text-sm text-gray-300">Origem</div>
              <div className="font-medium">{bookingData.origin}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-300">Destino</div>
              <div className="font-medium">{bookingData.destination}</div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div>
                <div className="text-sm text-gray-300">Distância</div>
                <div>{estimatedDistance} km</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-300">Tempo estimado</div>
                <div>{formatTime(estimatedTime)}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border border-white/10 rounded-lg p-4 bg-white/5">
          <h4 className="font-medium mb-3 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-amber-300" />
            Datas e horários
          </h4>
          
          <div className="space-y-3 pl-7">
            <div>
              <div className="text-sm text-gray-300">Data de ida</div>
              <div className="font-medium">{formatDate(bookingData.date)}</div>
              {bookingData.time && (
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  <span className="text-sm text-gray-300">{bookingData.time}</span>
                </div>
              )}
            </div>
            
            {bookingData.tripType === 'roundtrip' && (
              <div>
                <div className="text-sm text-gray-300">Data de retorno</div>
                <div className="font-medium">{formatDate(bookingData.returnDate)}</div>
                {bookingData.returnTime && (
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="text-sm text-gray-300">{bookingData.returnTime}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="border border-white/10 rounded-lg p-4 bg-white/5">
          <h4 className="font-medium mb-3 flex items-center">
            <Users className="h-5 w-5 mr-2 text-amber-300" />
            Passageiros
          </h4>
          
          <div className="space-y-4 pl-7">
            <div>
              <div className="text-sm text-gray-300">Número de passageiros</div>
              <div className="font-medium">{bookingData.passengers}</div>
            </div>
            
            {bookingData.passengerData && bookingData.passengerData.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm text-gray-300">Detalhes dos passageiros:</div>
                {bookingData.passengerData.map((passenger, index) => (
                  <div key={index} className="bg-white/10 p-3 rounded-md">
                    <div className="font-medium">Passageiro {index + 1}: {passenger.name}</div>
                    <div className="text-sm text-gray-300">WhatsApp: {passenger.phone}</div>
                  </div>
                ))}
              </div>
            )}
            
            <div>
              <div className="text-sm text-gray-300">Veículo</div>
              <div className="font-medium">{selectedVehicle?.name}</div>
              <div className="text-sm text-gray-300">{selectedVehicle?.description}</div>
            </div>
          </div>
        </div>
        
        <div className="border border-white/10 rounded-lg p-4 bg-white/5">
          <h4 className="font-medium mb-3 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-amber-300" />
            Pagamento
          </h4>
          
          <div className="space-y-3 pl-7">
            <div>
              <div className="text-sm text-gray-300">Método de pagamento</div>
              <div className="font-medium">{selectedPaymentMethodName}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-gray-300">Detalhamento do valor:</div>
              
              <div className="flex justify-between text-sm">
                <span>Tarifa base:</span>
                <span>{selectedVehicle && formatCurrency(selectedVehicle.basePrice)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Tarifa por km ({formatCurrency(selectedVehicle?.pricePerKm || 0)}/km × {estimatedDistance} km):</span>
                <span>{selectedVehicle && formatCurrency(selectedVehicle.pricePerKm * estimatedDistance)}</span>
              </div>
              
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
              
              <div className="flex justify-between font-medium text-amber-300 text-xl pt-2 border-t border-white/10 mt-2">
                <span>Valor total:</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-white/10 pt-4 mt-4 text-sm text-gray-300">
        Ao confirmar sua reserva, você concorda com nossos Termos de Serviço e Política de Privacidade.
      </div>
    </div>
  );
};

export default BookingConfirmation;
