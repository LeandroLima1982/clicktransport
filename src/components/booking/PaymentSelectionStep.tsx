
import React from 'react';
import { Button } from '@/components/ui/button';
import StepTransition from './StepTransition';
import { CreditCard, Landmark, QrCode, Building, ChevronLeft, ChevronRight } from 'lucide-react';

interface PaymentSelectionStepProps {
  selectedPaymentMethod: string | null;
  setSelectedPaymentMethod: (method: string) => void;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
  canProceedFromStep5: () => boolean;
  direction: number;
  currentStep: number;
  selectedVehicle: string | null;
  distanceInfo: { distance: number; duration: number } | null;
  tripType: "oneway" | "roundtrip";
  isFirstStep: boolean;
  isLastStep: boolean;
}

const PaymentSelectionStep: React.FC<PaymentSelectionStepProps> = ({
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  goToPreviousStep,
  goToNextStep,
  canProceedFromStep5,
  direction,
  currentStep,
  selectedVehicle,
  distanceInfo,
  tripType,
  isFirstStep,
  isLastStep
}) => {
  const paymentMethods = [
    { id: 'credit', name: 'Cartão de Crédito', icon: CreditCard },
    { id: 'pix', name: 'PIX', icon: QrCode },
    { id: 'bank', name: 'Transferência', icon: Landmark },
    { id: 'company', name: 'Faturar Empresa', icon: Building },
  ];

  // Vehicle data - simplified for this step
  const vehicles = {
    "sedan": { basePrice: 79.90, pricePerKm: 2.10 },
    "suv": { basePrice: 119.90, pricePerKm: 2.49 },
    "van": { basePrice: 199.90, pricePerKm: 3.39 }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateTripPrice = () => {
    if (!selectedVehicle || !distanceInfo) return 0;
    const vehicle = vehicles[selectedVehicle as keyof typeof vehicles];
    const price = vehicle.basePrice + (vehicle.pricePerKm * distanceInfo.distance);
    return tripType === 'roundtrip' ? price * 2 : price;
  };

  return (
    <StepTransition step={currentStep} direction={direction}>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-2 text-center">Forma de Pagamento</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {paymentMethods.map(method => {
            const Icon = method.icon;
            return (
              <div 
                key={method.id}
                onClick={() => setSelectedPaymentMethod(method.id)}
                className={`booking-input-container p-3 hover:bg-white/20 transition-colors cursor-pointer 
                          rounded-lg shadow-lg input-shadow ${
                            selectedPaymentMethod === method.id ? 'ring-2 ring-amber-400 bg-white/10' : ''
                          }`}
              >
                <div className="flex items-center">
                  <div className="bg-white/10 p-2 rounded-full mr-3">
                    <Icon className="w-4 h-4 text-amber-300" />
                  </div>
                  <span className="text-white font-medium">{method.name}</span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="booking-input-container p-3 bg-blue-900/30 rounded-lg shadow-lg mt-3">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Total:</span>
            <span className="text-xl font-bold text-amber-300">{formatCurrency(calculateTripPrice())}</span>
          </div>
          <div className="text-right text-white/60 text-xs mt-1">
            {tripType === 'roundtrip' ? 'Inclui ida e volta' : 'Somente ida'}
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <Button 
            onClick={goToPreviousStep}
            variant="outline" 
            className="px-3 md:px-4 py-2 h-auto rounded-lg text-white border-amber-300/50 hover:bg-white/10 hover:text-amber-300 shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
            disabled={isFirstStep}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            <span className="hidden md:inline">Voltar</span>
          </Button>
          <Button 
            onClick={goToNextStep} 
            disabled={!canProceedFromStep5()}
            className="px-3 md:px-4 py-2 h-auto rounded-lg text-[#002366] font-medium transition-all duration-300 
                      shadow-xl hover:shadow-2xl relative overflow-hidden bg-gradient-to-r from-amber-400 to-amber-300 
                      hover:from-amber-300 hover:to-amber-200 border border-amber-300 flex items-center"
          >
            <span className="hidden md:inline">Revisar</span>
            <span className="md:hidden">Revisar</span>
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepTransition>
  );
};

export default PaymentSelectionStep;
