import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { Vehicle } from './VehicleSelection';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

interface PaymentSelectionProps {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string | null;
  onSelectPaymentMethod: (id: string) => void;
  selectedVehicle: Vehicle | undefined;
  estimatedDistance: number;
  bookingData: {
    tripType: 'oneway' | 'roundtrip';
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
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Selecione a forma de pagamento</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary ${
                selectedPaymentMethod === method.id ? 'bg-primary/10 border-primary' : ''
              }`}
              onClick={() => onSelectPaymentMethod(method.id)}
            >
              <div className="flex items-center">
                <CreditCard className="mr-3 h-5 w-5 text-primary" />
                <div className="font-medium">{method.name}</div>
              </div>
            </div>
          ))}
        </div>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumo do pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Veículo</span>
                <span>{selectedVehicle?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Trajeto</span>
                <span>{estimatedDistance} km</span>
              </div>
              <div className="flex justify-between">
                <span>Tipo de viagem</span>
                <span>{bookingData.tripType === 'oneway' ? 'Somente ida' : 'Ida e volta'}</span>
              </div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSelection;
