
import React from 'react';
import { Button } from '@/components/ui/button';
import PassengerSelector from './PassengerSelector';
import StepTransition from './StepTransition';

interface PassengerSelectionStepProps {
  passengers: string;
  setPassengers: (passengers: string) => void;
  goToPreviousStep: () => void;
  handleBooking: () => void;
  canFinishBooking: () => boolean;
  direction: number;
  currentStep: number;
}

const PassengerSelectionStep: React.FC<PassengerSelectionStepProps> = ({
  passengers,
  setPassengers,
  goToPreviousStep,
  handleBooking,
  canFinishBooking,
  direction,
  currentStep
}) => {
  return (
    <StepTransition step={currentStep} direction={direction}>
      <div className="space-y-5 md:space-y-6">
        <div className="booking-input-container p-3 hover:bg-white/20 shadow-lg input-shadow">
          <PassengerSelector value={passengers} onChange={setPassengers} />
        </div>

        <div className="flex justify-between">
          <Button 
            onClick={goToPreviousStep}
            variant="outline" 
            className="px-4 rounded-lg text-white border-amber-300/50 hover:bg-white/10 hover:text-amber-300"
          >
            Voltar
          </Button>
          <Button 
            onClick={handleBooking} 
            disabled={!canFinishBooking()} 
            className="w-40 rounded-lg text-[#002366] text-lg font-medium h-12 transition-all duration-300 
                      shadow-xl relative overflow-hidden bg-gradient-to-r from-amber-400 to-amber-300 
                      hover:from-amber-300 hover:to-amber-200 border border-amber-300"
          >
            <span className="relative z-10 flex items-center justify-center">
              Buscar Motorista
            </span>
          </Button>
        </div>
      </div>
    </StepTransition>
  );
};

export default PassengerSelectionStep;
