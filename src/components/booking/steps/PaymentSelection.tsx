
import React from 'react';
import { Check, CreditCard, QrCode, Building, Landmark } from 'lucide-react';
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
      case 'building':
        return <Building className="h-5 w-5" />;
      case 'bank':
        return <Landmark className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Escolha a forma de pagamento</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedPaymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-gray-200'
            }`}
            onClick={() => onSelectPaymentMethod(method.id)}
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-full mr-3 ${
                selectedPaymentMethod === method.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {renderIcon(method.icon)}
              </div>
              <div>
                <div className="font-medium">{method.name}</div>
              </div>
              {selectedPaymentMethod === method.id && (
                <Check className="ml-auto h-5 w-5 text-primary" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <h4 className="font-medium mb-2">Resumo de valores</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Base ({selectedVehicle?.name})</span>
            <span>{formatCurrency(selectedVehicle?.basePrice || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Distância ({estimatedDistance} km x {formatCurrency(selectedVehicle?.pricePerKm || 0)}/km)</span>
            <span>{formatCurrency((selectedVehicle?.pricePerKm || 0) * estimatedDistance)}</span>
          </div>
          {bookingData.tripType === 'roundtrip' && (
            <div className="flex justify-between text-sm">
              <span>Taxa de retorno</span>
              <span>{formatCurrency(totalPrice * 0.8)}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSelection;
