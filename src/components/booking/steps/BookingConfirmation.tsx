
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
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
    tripType: 'oneway' | 'roundtrip';
    passengers: string;
  };
  totalPrice: number;
  formatCurrency: (value: number) => string;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  selectedVehicle,
  selectedPaymentMethod,
  paymentMethods,
  bookingData,
  totalPrice,
  formatCurrency
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Confirme sua reserva</h3>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold">Tudo pronto!</h4>
              <p className="text-gray-500">Revise os detalhes abaixo e confirme sua reserva</p>
            </div>
            
            <div className="border-t border-b py-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Veículo:</span>
                <span className="font-medium">{selectedVehicle?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Origem:</span>
                <span className="font-medium">{bookingData.origin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Destino:</span>
                <span className="font-medium">{bookingData.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Data:</span>
                <span className="font-medium">
                  {bookingData.date ? format(bookingData.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Não especificado'}
                </span>
              </div>
              {bookingData.tripType === 'roundtrip' && bookingData.returnDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Retorno:</span>
                  <span className="font-medium">
                    {format(bookingData.returnDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Passageiros:</span>
                <span className="font-medium">{bookingData.passengers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pagamento:</span>
                <span className="font-medium">
                  {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name || 'Não selecionado'}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-xl text-primary">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingConfirmation;
