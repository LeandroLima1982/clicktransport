
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface BookingConfirmationProps {
  selectedVehicle: any;
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
    passengerData?: { name: string; phone: string }[];
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
  const getPaymentMethodName = () => {
    return paymentMethods.find(m => m.id === selectedPaymentMethod)?.name || '';
  };
  
  const getPassengerNames = () => {
    if (!bookingData.passengerData || bookingData.passengerData.length === 0) {
      return 'Dados não informados';
    }
    
    return bookingData.passengerData.map(p => p.name || 'Sem nome').join(', ');
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Confirme sua reserva</h3>
      
      <Card className="bg-[#002366]/70 border-amber-300/30 text-white shadow-md">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-400/20 text-amber-300 mb-2">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold">Tudo pronto!</h4>
              <p className="text-white/70">Revise os detalhes abaixo e confirme sua reserva</p>
            </div>
            
            <div className="border-t border-b border-amber-300/20 py-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-white/70">Veículo:</span>
                <span className="font-medium">{selectedVehicle?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Origem:</span>
                <span className="font-medium max-w-[70%] text-right">{bookingData.origin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Destino:</span>
                <span className="font-medium max-w-[70%] text-right">{bookingData.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Distância:</span>
                <span className="font-medium">{estimatedDistance} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Duração estimada:</span>
                <span className="font-medium">{Math.floor(estimatedTime / 60)}h {estimatedTime % 60}min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Data:</span>
                <span className="font-medium">
                  {bookingData.date?.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) || 'Não especificado'}
                  {bookingData.time ? ` às ${bookingData.time}` : ''}
                </span>
              </div>
              {bookingData.tripType === 'roundtrip' && bookingData.returnDate && (
                <div className="flex justify-between">
                  <span className="text-white/70">Retorno:</span>
                  <span className="font-medium">
                    {bookingData.returnDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    {bookingData.returnTime ? ` às ${bookingData.returnTime}` : ''}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/70">Passageiros:</span>
                <span className="font-medium">{bookingData.passengers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Nomes:</span>
                <span className="font-medium max-w-[70%] text-right">{getPassengerNames()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Pagamento:</span>
                <span className="font-medium">{getPaymentMethodName()}</span>
              </div>
            </div>
            
            {selectedVehicle && (
              <div className="border-b border-amber-300/20 py-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/70">Preço base:</span>
                  <span className="font-medium">{formatCurrency(selectedVehicle.basePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Distância ({estimatedDistance} km x {formatCurrency(selectedVehicle.pricePerKm)}):</span>
                  <span className="font-medium">{formatCurrency(selectedVehicle.pricePerKm * estimatedDistance)}</span>
                </div>
                {bookingData.tripType === 'roundtrip' && (
                  <div className="flex justify-between">
                    <span className="text-white/70">Multiplicador de ida e volta:</span>
                    <span className="font-medium">x2</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-xl text-amber-300">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingConfirmation;
