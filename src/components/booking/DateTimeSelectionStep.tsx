
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import DateSelector from './DateSelector';
import TimeSelector from '../TimeSelector';
import TripTypeTabs from './TripTypeTabs';
import { ArrowRightCircle } from 'lucide-react';
import StepTransition from './StepTransition';

interface DateTimeSelectionStepProps {
  date: Date | undefined;
  returnDate: Date | undefined;
  time: string;
  returnTime: string;
  tripType: "oneway" | "roundtrip";
  setDate: (date: Date | undefined) => void;
  setReturnDate: (date: Date | undefined) => void;
  setTime: (time: string) => void;
  setReturnTime: (time: string) => void;
  setTripType: (type: "oneway" | "roundtrip") => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canProceedFromStep2: () => boolean;
  direction: number;
  currentStep: number;
}

const DateTimeSelectionStep: React.FC<DateTimeSelectionStepProps> = ({
  date,
  returnDate,
  time,
  returnTime,
  tripType,
  setDate,
  setReturnDate,
  setTime,
  setReturnTime,
  setTripType,
  goToNextStep,
  goToPreviousStep,
  canProceedFromStep2,
  direction,
  currentStep
}) => {
  return (
    <StepTransition step={currentStep} direction={direction}>
      <div className="space-y-5 md:space-y-6">
        <div className="flex justify-center mb-6 mt-1">
          <TripTypeTabs value={tripType} onChange={setTripType} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          <div className="md:col-span-2 booking-input-container p-3 hover:bg-white/20 shadow-lg input-shadow">
            <Label className="booking-label block text-sm font-semibold mb-2">
              Vai quando?
            </Label>
            <div className="flex flex-col sm:flex-row sm:space-x-0">
              <div className="sm:w-1/2 mb-2 sm:mb-0">
                <DateSelector 
                  hideLabel 
                  date={date} 
                  onSelect={setDate} 
                  disabledDates={date => date < new Date()} 
                  isConnected={true} 
                  position="left" 
                />
              </div>
              <div className="sm:w-1/2">
                <TimeSelector value={time} onChange={setTime} connected position="right" />
              </div>
            </div>
          </div>
        </div>

        {tripType === 'roundtrip' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 mt-1 border-t border-[#D4AF37]">
            <div className="booking-input-container p-3 hover:bg-white/20 shadow-lg input-shadow">
              <Label className="booking-label block text-sm font-semibold mb-2">
                Volta quando?
              </Label>
              <div className="flex flex-col sm:flex-row sm:space-x-0">
                <div className="sm:w-1/2 mb-2 sm:mb-0">
                  <DateSelector 
                    hideLabel 
                    date={returnDate} 
                    onSelect={setReturnDate} 
                    disabledDates={currentDate => currentDate < (date || new Date())} 
                    isConnected={true} 
                    position="left" 
                  />
                </div>
                <div className="sm:w-1/2">
                  <TimeSelector value={returnTime} onChange={setReturnTime} connected position="right" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button 
            onClick={goToPreviousStep}
            variant="outline" 
            className="px-4 rounded-lg text-white border-amber-300/50 hover:bg-white/10 hover:text-amber-300"
          >
            Voltar
          </Button>
          <Button 
            onClick={goToNextStep} 
            disabled={!canProceedFromStep2()} 
            className="px-6 rounded-lg text-[#002366] font-medium h-10 transition-all duration-300 
                      shadow-xl relative overflow-hidden bg-gradient-to-r from-amber-400 to-amber-300 
                      hover:from-amber-300 hover:to-amber-200 border border-amber-300 flex items-center"
          >
            Próximo
            <ArrowRightCircle className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepTransition>
  );
};

export default DateTimeSelectionStep;
