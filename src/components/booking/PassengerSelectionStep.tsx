
import React from 'react';
import { Button } from '@/components/ui/button';
import StepTransition from './StepTransition';
import { Users } from 'lucide-react';
import PassengerSelector from './PassengerSelector';

interface PassengerSelectionStepProps {
  passengers: string;
  setPassengers: (passengers: string) => void;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
  canProceedFromStep3: () => boolean;
  direction: number;
  currentStep: number;
}

const PassengerSelectionStep: React.FC<PassengerSelectionStepProps> = ({
  passengers,
  setPassengers,
  goToPreviousStep,
  goToNextStep,
  canProceedFromStep3,
  direction,
  currentStep
}) => {
  return (
    <StepTransition step={currentStep} direction={direction}>
      <div className="space-y-3">
        <div className="booking-input-container p-3 hover:bg-white/20 shadow-lg input-shadow text-center rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-1">Quantos Passageiros?</h3>
          <p className="text-white/80 mb-3 text-sm">
            Informe o número de passageiros para esta viagem
          </p>
          
          <div className="mx-auto max-w-xs mb-2">
            <PassengerSelector value={passengers} onChange={setPassengers} />
          </div>
          
          <p className="text-amber-300 text-xs mt-2">
            Você pode adicionar detalhes dos passageiros nas próximas etapas
          </p>
        </div>

        <div className="flex justify-between mt-3">
          <Button 
            onClick={goToPreviousStep}
            variant="outline" 
            className="px-4 rounded-lg text-white border-amber-300/50 hover:bg-white/10 hover:text-amber-300 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Voltar
          </Button>
          <Button 
            onClick={goToNextStep} 
            disabled={!canProceedFromStep3()}
            className="rounded-lg text-[#002366] font-medium h-10 transition-all duration-300 
                      shadow-xl hover:shadow-2xl relative overflow-hidden bg-gradient-to-r from-amber-400 to-amber-300 
                      hover:from-amber-300 hover:to-amber-200 border border-amber-300 px-4"
          >
            <span className="relative z-10 flex items-center justify-center">
              Próximo
            </span>
          </Button>
        </div>
      </div>
    </StepTransition>
  );
};

export default PassengerSelectionStep;
