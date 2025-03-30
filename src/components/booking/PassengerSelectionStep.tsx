
import React from 'react';
import { Button } from '@/components/ui/button';
import StepTransition from './StepTransition';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';
import PassengerSelector from './PassengerSelector';
import PassengerInfoFields from './PassengerInfoFields';
import { PassengerInfo } from '@/types/booking.types';

interface PassengerSelectionStepProps {
  passengers: string;
  setPassengers: (passengers: string) => void;
  passengerData: PassengerInfo[];
  setPassengerData: (data: PassengerInfo[]) => void;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
  canProceedFromStep3: () => boolean;
  direction: number;
  currentStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const PassengerSelectionStep: React.FC<PassengerSelectionStepProps> = ({
  passengers,
  setPassengers,
  passengerData,
  setPassengerData,
  goToPreviousStep,
  goToNextStep,
  canProceedFromStep3,
  direction,
  currentStep,
  isFirstStep,
  isLastStep
}) => {
  return (
    <StepTransition step={currentStep} direction={direction}>
      <div className="space-y-4">
        <div className="booking-input-container p-3 hover:bg-white/20 shadow-lg input-shadow text-center rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-1">Dados dos Passageiros</h3>
          <p className="text-white/80 mb-4 text-sm">
            Informe os dados de cada passageiro para esta viagem
          </p>
          
          <div className="mx-auto max-w-xs mb-4">
            <PassengerSelector value={passengers} onChange={setPassengers} />
          </div>
          
          <PassengerInfoFields
            passengerCount={parseInt(passengers, 10)}
            passengerData={passengerData}
            onPassengerDataChange={setPassengerData}
          />
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
            disabled={!canProceedFromStep3()}
            className="px-3 md:px-4 py-2 h-auto rounded-lg text-[#002366] font-medium transition-all duration-300 
                      shadow-xl hover:shadow-2xl relative overflow-hidden bg-gradient-to-r from-amber-400 to-amber-300 
                      hover:from-amber-300 hover:to-amber-200 border border-amber-300 flex items-center"
          >
            <span className="hidden md:inline">Revisar</span>
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepTransition>
  );
};

export default PassengerSelectionStep;
