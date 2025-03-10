
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Car, MapPin, Calendar, CreditCard, Clock, Check } from 'lucide-react';
import { Vehicle } from './VehicleSelection';
import { formatTravelTime } from '@/utils/routeUtils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      {isMobile ? (
        // App-like confirmation design for mobile
        <div className="animate-app-reveal">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold">Confirme sua reserva</h3>
            <p className="text-gray-500 text-sm">Verifique os detalhes abaixo</p>
          </div>
          
          {/* Vehicle details */}
          <div className="app-card p-4 mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">Veículo</div>
                <div className="text-gray-600 text-sm">{selectedVehicle?.name}</div>
              </div>
            </div>
          </div>
          
          {/* Route details */}
          <div className="app-card p-4 mb-4">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-1">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Trajeto</div>
                <div className="bg-gray-50 rounded-xl p-3 my-2">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <div className="text-sm truncate">{bookingData.origin}</div>
                  </div>
                  <div className="border-l-2 border-dashed border-gray-300 h-6 ml-1"></div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                    <div className="text-sm truncate">{bookingData.destination}</div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm mt-3">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-gray-500" />
                    <span>{formatTravelTime(estimatedTime)}</span>
                  </div>
                  <div>{estimatedDistance} km</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Date and time details */}
          <div className="app-card p-4 mb-4">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">Data e Horário</div>
                <div className="text-gray-600 text-sm">
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    Ida: {bookingData.date ? format(bookingData.date, "dd/MM/yyyy", { locale: ptBR }) : ''}
                    {bookingData.time ? ` às ${bookingData.time}` : ''}
                  </div>
                  
                  {bookingData.tripType === 'roundtrip' && (
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                      Volta: {bookingData.returnDate ? format(bookingData.returnDate, "dd/MM/yyyy", { locale: ptBR }) : ''}
                      {bookingData.returnTime ? ` às ${bookingData.returnTime}` : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment details */}
          <div className="app-card p-4 mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">Forma de Pagamento</div>
                <div className="text-gray-600 text-sm">{selectedPaymentOption?.name || 'Não selecionado'}</div>
              </div>
            </div>
          </div>
          
          {/* Price details - highlighted */}
          <div className="app-card bg-primary/10 p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium">Valor Total</div>
                <div className="text-xs text-gray-500">
                  {bookingData.tripType === 'roundtrip' ? 'Inclui ida e volta' : 'Somente ida'}
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</div>
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-500 mt-4">
            Ao confirmar sua reserva, você concorda com nossos termos de serviço e políticas de cancelamento.
          </div>
        </div>
      ) : (
        // Original design for desktop
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
      )}
    </div>
  );
};

export default BookingConfirmation;
