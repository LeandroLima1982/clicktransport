
import React from 'react';
import { Button } from '@/components/ui/button';
import StepTransition from './StepTransition';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TripTypeTabs from './TripTypeTabs';
import DateSelector from './DateSelector';
import TimeSelector from '../TimeSelector';

interface DateTimeSelectionStepProps {
  date: Date | undefined;
  returnDate: Date | undefined;
  time: string;
  returnTime: string;
  tripType: "oneway" | "roundtrip";
  passengers: string;
  setDate: (date: Date | undefined) => void;
  setReturnDate: (date: Date | undefined) => void;
  setTime: (time: string) => void;
  setReturnTime: (time: string) => void;
  setTripType: (type: "oneway" | "roundtrip") => void;
  setPassengers: (passengers: string) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canProceedFromStep2: () => boolean;
  direction: number;
  currentStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const DateTimeSelectionStep: React.FC<DateTimeSelectionStepProps> = ({
  date,
  returnDate,
  time,
  returnTime,
  tripType,
  passengers,
  setDate,
  setReturnDate,
  setTime,
  setReturnTime,
  setTripType,
  setPassengers,
  goToNextStep,
  goToPreviousStep,
  canProceedFromStep2,
  direction,
  currentStep,
  isFirstStep,
  isLastStep
}) => {

  return (
    <StepTransition step={currentStep} direction={direction}>
      <div className="space-y-4">
        <div className="booking-input-container p-3 hover:bg-white/20 shadow-lg input-shadow text-center rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-1">Escolha as Datas</h3>
          <p className="text-white/80 mb-4 text-sm">
            Selecione as datas e horários para sua viagem
          </p>
          
          <div className="mb-4">
            <TripTypeTabs value={tripType} onChange={setTripType} />
          </div>
          
          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/90">Data de Ida</label>
              <DateSelector 
                date={date} 
                onDateChange={setDate} 
                className="bg-white/10 text-white border-white/20"
              />
              <TimeSelector 
                value={time} 
                onChange={setTime}
                className="bg-white/10 border-white/20 text-white mt-2"
              />
            </div>
            
            {tripType === 'roundtrip' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">Data de Volta</label>
                <DateSelector 
                  date={returnDate} 
                  onDateChange={setReturnDate}
                  className="bg-white/10 text-white border-white/20"
                  minDate={date}
                />
                <TimeSelector 
                  value={returnTime} 
                  onChange={setReturnTime}
                  className="bg-white/10 border-white/20 text-white mt-2"
                />
              </div>
            )}
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
            disabled={!canProceedFromStep2()}
            className="px-3 md:px-4 py-2 h-auto rounded-lg text-[#002366] font-medium transition-all duration-300 
                      shadow-xl hover:shadow-2xl relative overflow-hidden bg-gradient-to-r from-amber-400 to-amber-300 
                      hover:from-amber-300 hover:to-amber-200 border border-amber-300 flex items-center"
          >
            <span className="hidden md:inline">Próximo</span>
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepTransition>
  );
};

export default DateTimeSelectionStep;
