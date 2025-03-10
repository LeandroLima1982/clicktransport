
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Banknote, Wallet, CheckCircle2 } from 'lucide-react';
import { Vehicle } from './VehicleSelection';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  // Map payment method icons to Lucide icons
  const getPaymentIcon = (methodId: string) => {
    switch (methodId) {
      case 'credit_card':
        return <CreditCard className="h-5 w-5" />;
      case 'money':
        return <Banknote className="h-5 w-5" />;
      case 'pix':
        return <Wallet className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Selecione a forma de pagamento</h3>
      
      <div className="space-y-4">
        {isMobile ? (
          // App-like payment method selection for mobile
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`app-card flex items-center p-4 ${
                  selectedPaymentMethod === method.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onSelectPaymentMethod(method.id)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedPaymentMethod === method.id ? 'bg-primary text-white' : 'bg-gray-100'
                }`}>
                  {getPaymentIcon(method.id)}
                </div>
                
                <div className="ml-4 flex-1">
                  <div className="font-medium">{method.name}</div>
                </div>
                
                {selectedPaymentMethod === method.id && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </div>
            ))}
          </div>
        ) : (
          // Original grid layout for desktop
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
        )}
        
        {/* Order summary with app-like design on mobile */}
        {isMobile ? (
          <div className="mt-6 app-card overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h4 className="font-semibold">Resumo do pedido</h4>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Veículo</span>
                <span className="font-medium">{selectedVehicle?.name}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Trajeto</span>
                <span className="font-medium">{estimatedDistance} km</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tipo de viagem</span>
                <span className="font-medium">{bookingData.tripType === 'oneway' ? 'Somente ida' : 'Ida e volta'}</span>
              </div>
              
              <div className="border-t my-2"></div>
              
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
        ) : (
          // Original card for desktop
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
        )}
      </div>
    </div>
  );
};

export default PaymentSelection;
