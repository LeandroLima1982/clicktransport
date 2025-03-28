
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
      <div className="space-y-5 md:space-y-6">
        <div className="booking-input-container p-5 hover:bg-white/20 shadow-lg input-shadow text-center">
          <h3 className="text-xl font-semibold text-white mb-3">Confirmar Reserva</h3>
          <p className="text-white/80 mb-6">
            Você está pronto para confirmar sua reserva de transporte com {passengers} {parseInt(passengers) === 1 ? 'passageiro' : 'passageiros'}.
          </p>
          <p className="text-amber-300 text-sm mb-4">
            Ao clicar em "Buscar Motorista", você confirma seus dados de viagem e será direcionado para completar a reserva.
          </p>
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
