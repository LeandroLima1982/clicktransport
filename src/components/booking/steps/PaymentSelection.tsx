
import React from 'react';
import { CreditCard, Banknote, QrCode, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    tripType: string;
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
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'credit-card':
        return <CreditCard className="h-5 w-5" />;
      case 'qr-code':
        return <QrCode className="h-5 w-5" />;
      case 'bank':
        return <Banknote className="h-5 w-5" />;
      case 'building':
        return <Building className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Método de Pagamento</h3>
        <p className="text-sm text-gray-500">
          Escolha como deseja pagar por este serviço
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedPaymentMethod === method.id 
                ? 'bg-primary/10 border-primary' 
                : 'hover:border-gray-300'
            }`}
            onClick={() => onSelectPaymentMethod(method.id)}
          >
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedPaymentMethod === method.id
                  ? 'bg-primary/20 text-primary'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {renderIcon(method.icon)}
              </div>
              
              <div className="ml-3">
                <div className="font-medium">{method.name}</div>
              </div>
              
              <div className="ml-auto">
                <div className={`w-5 h-5 rounded-full border ${
                  selectedPaymentMethod === method.id
                    ? 'border-4 border-primary'
                    : 'border border-gray-300'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <Card className="mt-6">
        <CardHeader className="py-3">
          <CardTitle className="text-base">Resumo de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          {selectedVehicle && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Taxa base ({selectedVehicle.name})</span>
                  <span>{formatCurrency(selectedVehicle.basePrice)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Distância ({estimatedDistance} km × {formatCurrency(selectedVehicle.pricePerKm)}/km)</span>
                  <span>{formatCurrency(estimatedDistance * selectedVehicle.pricePerKm)}</span>
                </div>
                
                {bookingData.tripType === 'roundtrip' && (
                  <div className="flex justify-between text-sm">
                    <span>Multiplicador de viagem de ida e volta (×2)</span>
                    <span>×2</span>
                  </div>
                )}
                
                <div className="border-t my-2"></div>
                
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                <p>• Pagamento processado de forma segura</p>
                <p>• Valores podem ser ajustados com base na rota real</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSelection;
