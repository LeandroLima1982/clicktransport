import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Car, MapPin, Calendar, CreditCard, Clock } from 'lucide-react';
import { Vehicle } from './VehicleSelection';
import { formatTravelTime } from '@/utils/routeUtils';

interface BookingConfirmationProps {
  selectedVehicle: Vehicle | undefined;
  selectedPaymentMethod: string | null;
  paymentMethods: { id: string; name: string; icon: string }[];
  bookingData: {
    origin: string;
    destination: string;
    date: Date | undefined;
    returnDate: Date | undefined;
    tripType: 'oneway' | 'roundtrip';
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
  const selectedPaymentOption = paymentMethods.find(method => method.id === selectedPaymentMethod);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Confirme sua reserva</h3>
        <p className="text-gray-500">Verifique os detalhes abaixo antes de confirmar</p>
      </div>
      
      <Card className="border border-green-100 bg-green-50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Car className="w-5 h-5 text-primary mt-1" />
              <div>
                <div className="font-medium">Veículo</div>
                <div className="text-gray-600">{selectedVehicle?.name} - {selectedVehicle?.description}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-primary mt-1" />
              <div>
                <div className="font-medium">Trajeto</div>
                <div className="text-gray-600">De: {bookingData.origin}</div>
                <div className="text-gray-600">Para: {bookingData.destination}</div>
                <div className="text-gray-600">Distância: {estimatedDistance} km</div>
                <div className="text-gray-600">Duração estimada: {formatTravelTime(estimatedTime)}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Calendar className="w-5 h-5 text-primary mt-1" />
              <div>
                <div className="font-medium">Data e Horário</div>
                <div className="text-gray-600">
                  Ida: {bookingData.date ? format(bookingData.date, "dd/MM/yyyy", { locale: ptBR }) : ''}
                  {bookingData.time ? ` às ${bookingData.time}` : ''}
                </div>
                {bookingData.tripType === 'roundtrip' && (
                  <div className="text-gray-600">
                    Volta: {bookingData.returnDate ? format(bookingData.returnDate, "dd/MM/yyyy", { locale: ptBR }) : ''}
                    {bookingData.returnTime ? ` às ${bookingData.returnTime}` : ''}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <CreditCard className="w-5 h-5 text-primary mt-1" />
              <div>
                <div className="font-medium">Forma de Pagamento</div>
                <div className="text-gray-600">{selectedPaymentOption?.name || 'Não selecionado'}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Clock className="w-5 h-5 text-primary mt-1" />
              <div>
                <div className="font-medium">Valor Total</div>
                <div className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</div>
                <div className="text-sm text-gray-500">
                  {bookingData.tripType === 'roundtrip' ? 'Inclui ida e volta' : 'Somente ida'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-gray-500">
        Ao confirmar sua reserva, você concorda com nossos termos de serviço e políticas de cancelamento.
      </div>
    </div>
  );
};

export default BookingConfirmation;
