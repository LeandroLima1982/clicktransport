import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import DateSelector from './DateSelector';
import TimeSelector from '../TimeSelector';
import { ArrowRightCircle, Plane, ArrowLeftRight } from 'lucide-react';
import StepTransition from './StepTransition';
import PassengerSelector from './PassengerSelector';
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
  currentStep
}) => {
  const handleTripTypeToggle = (checked: boolean) => {
    setTripType(checked ? "roundtrip" : "oneway");
  };
  return <StepTransition step={currentStep} direction={direction}>
      <div className="space-y-3">
        <div className="flex justify-between items-center mb-1">
          <div className="text-xs font-medium text-white">Tipo de Viagem</div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-white/80 flex items-center">
              <Plane className="w-3 h-3 mr-1" />
              Ida
            </span>
            <Switch checked={tripType === "roundtrip"} onCheckedChange={handleTripTypeToggle} className="data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-300" />
            <span className="text-[10px] text-white/80 flex items-center">
              <ArrowLeftRight className="w-3 h-3 mr-1" />
              Ida/Volta
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="booking-input-container p-2 hover:bg-white/20 transition-colors duration-200 shadow-lg input-shadow rounded-lg">
            <Label className="block text-xs font-semibold booking-label mb-1">
              Vai quando?
            </Label>
            <div className="flex flex-col space-y-2">
              <DateSelector hideLabel date={date} onSelect={setDate} disabledDates={date => date < new Date()} isConnected={true} position="left" />
              <TimeSelector value={time} onChange={setTime} connected position="right" />
            </div>
          </div>
          
          <div className="booking-input-container p-2 hover:bg-white/20 transition-colors duration-200 shadow-lg input-shadow rounded-lg">
            <Label className="block text-xs font-semibold booking-label mb-1">
              {tripType === "roundtrip" ? "Volta quando?" : "Passageiros"}
            </Label>
            {tripType === "roundtrip" ? <div className="flex flex-col space-y-2">
                <DateSelector hideLabel date={returnDate} onSelect={setReturnDate} disabledDates={currentDate => currentDate < (date || new Date())} isConnected={true} position="left" />
                <TimeSelector value={returnTime} onChange={setReturnTime} connected position="right" />
              </div> : <PassengerSelector value={passengers} onChange={setPassengers} />}
          </div>
        </div>

        {tripType === "roundtrip" && <div className="booking-input-container p-2 hover:bg-white/20 transition-colors duration-200 shadow-lg input-shadow rounded-lg">
            <Label className="block text-xs font-semibold booking-label mb-1">
              Passageiros
            </Label>
            <PassengerSelector value={passengers} onChange={setPassengers} />
          </div>}

        <div className="flex justify-between mt-2">
          <Button onClick={goToPreviousStep} variant="outline" className="px-4 rounded-lg text-white border-amber-300/50 hover:text-amber-300 shadow-md hover:shadow-lg transition-all duration-300 bg-indigo-950 hover:bg-indigo-800">
            Voltar
          </Button>
          <Button onClick={goToNextStep} disabled={!canProceedFromStep2()} className="px-6 rounded-lg text-[#002366] font-medium h-10 transition-all duration-300 
                    shadow-md hover:shadow-lg relative overflow-hidden bg-gradient-to-r from-amber-400 to-amber-300 
                    hover:from-amber-300 hover:to-amber-200 border border-amber-300 flex items-center animate-pulse">
            Próximo
            <ArrowRightCircle className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepTransition>;
};
export default DateTimeSelectionStep;