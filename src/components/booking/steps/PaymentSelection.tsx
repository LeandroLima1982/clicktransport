
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, QrCode, Bank, Building } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

interface PaymentSelectionProps {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string | null;
  onSelectPaymentMethod: (methodId: string) => void;
  selectedVehicle: any;
  estimatedDistance: number;
  bookingData: {
    origin: string;
    destination: string;
    date: Date | undefined;
    returnDate: Date | undefined;
    tripType: 'oneway' | 'roundtrip';
    passengers: string;
    time?: string;
    returnTime?: string;
    passengerData?: { name: string; phone: string }[] | null;
  };
  totalPrice: number;
  formatCurrency: (value: number) => string;
}

const PaymentSelection: React.FC<PaymentSelectionProps> = ({
  paymentMethods,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  selectedVehicle,
  estimatedDistance,
  bookingData,
  totalPrice,
  formatCurrency
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'credit-card':
        return <CreditCard className="w-6 h-6" />;
      case 'qr-code':
        return <QrCode className="w-6 h-6" />;
      case 'bank':
        return <Bank className="w-6 h-6" />;
      case 'building':
        return <Building className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Selecione a forma de pagamento</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all bg-[#002366]/70 text-white
                ${selectedPaymentMethod === method.id 
                ? 'bg-[#002366] border-amber-400 ring-1 ring-amber-400' 
                : 'border-amber-300/20 hover:border-amber-300/50'}`}
              onClick={() => onSelectPaymentMethod(method.id)}
            >
              <div className="flex items-center">
                <div className="mr-3 text-amber-300">
                  {getIcon(method.icon)}
                </div>
                <div className="font-medium">{method.name}</div>
              </div>
            </div>
          ))}
        </div>
        
        <Card className="mt-6 bg-[#002366]/70 border-amber-300/30 text-white shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-300">Resumo do pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/80">Veículo</span>
                <span className="text-white">{selectedVehicle?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Trajeto</span>
                <span className="text-white">{estimatedDistance} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Passageiros</span>
                <span className="text-white">{bookingData.passengers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Tipo de viagem</span>
                <span className="text-white">{bookingData.tripType === 'oneway' ? 'Somente ida' : 'Ida e volta'}</span>
              </div>
              
              {selectedVehicle && (
                <>
                  <div className="border-t border-amber-300/20 my-2"></div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Preço base</span>
                    <span className="text-white">{formatCurrency(selectedVehicle.basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Distância ({formatCurrency(selectedVehicle.pricePerKm)}/km)</span>
                    <span className="text-white">{formatCurrency(selectedVehicle.pricePerKm * estimatedDistance)}</span>
                  </div>
                  {bookingData.tripType === 'roundtrip' && (
                    <div className="flex justify-between">
                      <span className="text-white/80">Multiplicador de ida e volta (2x)</span>
                      <span className="text-white">2x</span>
                    </div>
                  )}
                </>
              )}
              
              <div className="border-t border-amber-300/20 my-2"></div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-amber-300">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSelection;
