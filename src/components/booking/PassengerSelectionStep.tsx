
import React from 'react';
import { Button } from '@/components/ui/button';
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
      <div className="space-y-3">
        <div className="booking-input-container p-3 hover:bg-white/20 shadow-lg input-shadow text-center rounded-lg bg-gradient-to-r from-[#002366]/80 to-[#001a4d] border border-amber-300/20">
          <h3 className="text-lg font-semibold text-white mb-1">Confirmar Reserva</h3>
          <p className="text-white/80 mb-2 text-sm">
            Você está pronto para confirmar sua reserva com {passengers} {parseInt(passengers) === 1 ? 'passageiro' : 'passageiros'}.
          </p>
          <p className="text-amber-300 text-xs mb-1">
            Ao clicar em "Buscar Motorista", você confirma seus dados de viagem.
          </p>
        </div>

        <div className="flex justify-between mt-2">
          <Button 
            onClick={goToPreviousStep}
            variant="outline" 
            className="px-4 rounded-lg text-white border-amber-300/50 hover:bg-white/10 hover:text-amber-300 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Voltar
          </Button>
          <Button 
            onClick={handleBooking} 
            disabled={!canFinishBooking()} 
            className="rounded-lg text-[#002366] text-lg font-medium h-11 transition-all duration-300 
                      shadow-xl hover:shadow-2xl relative overflow-hidden bg-gradient-to-r from-amber-400 to-amber-300 
                      hover:from-amber-300 hover:to-amber-200 border border-amber-300 px-4 animate-pulse"
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
