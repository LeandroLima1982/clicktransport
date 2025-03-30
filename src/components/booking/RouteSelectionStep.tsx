
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin, ChevronRight } from 'lucide-react';
import StepTransition from './StepTransition';

interface RouteSelectionStepProps {
  originValue: string;
  destinationValue: string;
  originCityId: string;
  destinationCityId: string;
  cities: any[];
  handleManualOriginChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleManualDestinationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setOriginCityId: (value: string) => void;
  setDestinationCityId: (value: string) => void;
  goToNextStep: () => void;
  canProceedFromStep1: () => boolean;
  direction: number;
  currentStep: number;
  formatCityLabel: (city: any) => string;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const RouteSelectionStep: React.FC<RouteSelectionStepProps> = ({
  originValue,
  destinationValue,
  originCityId,
  destinationCityId,
  cities,
  handleManualOriginChange,
  handleManualDestinationChange,
  setOriginCityId,
  setDestinationCityId,
  goToNextStep,
  canProceedFromStep1,
  direction,
  currentStep,
  formatCityLabel,
  isFirstStep,
  isLastStep
}) => {
  return (
    <StepTransition step={currentStep} direction={direction}>
      <div className="space-y-3">
        <div className="grid gap-3">
          <div className="booking-input-container p-3 hover:bg-white/20 transition-colors duration-200 shadow-lg input-shadow rounded-lg">
            <Label className="block text-sm font-semibold booking-label mb-2 text-white">
              De onde vai sair?
            </Label>
            <div className="flex flex-col space-y-2">
              <div className="relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                  <MapPin className="h-4 w-4 text-[#F8D748]" />
                </div>
                <Input 
                  placeholder="Digite seu endereço" 
                  value={originValue} 
                  onChange={handleManualOriginChange} 
                  className="pl-8 pr-3 py-2 text-sm booking-input h-10 focus:border-[#F8D748] focus:ring-[#F8D748] placeholder:text-white/50" 
                />
              </div>
              <Select value={originCityId} onValueChange={setOriginCityId}>
                <SelectTrigger className="h-10 booking-input text-white border-[#D4AF37]/60 focus:border-[#F8D748] focus:ring-[#F8D748]">
                  <SelectValue placeholder="Selecione cidade" className="text-white/50" />
                </SelectTrigger>
                <SelectContent className="bg-[#002366] border border-[#D4AF37] text-white">
                  {cities.filter(city => city.is_active !== false).map(city => (
                    <SelectItem key={city.id} value={city.id} className="hover:bg-white/10 text-white">
                      {formatCityLabel(city)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="booking-input-container p-3 hover:bg-white/20 transition-colors duration-200 shadow-lg input-shadow rounded-lg">
            <Label className="block text-sm font-semibold booking-label mb-2 text-white">
              Para onde vai?
            </Label>
            <div className="flex flex-col space-y-2">
              <div className="relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                  <MapPin className="h-4 w-4 text-[#F8D748]" />
                </div>
                <Input 
                  placeholder="Digite seu destino" 
                  value={destinationValue} 
                  onChange={handleManualDestinationChange} 
                  className="pl-8 pr-3 py-2 text-sm booking-input h-10 focus:border-[#F8D748] focus:ring-[#F8D748] placeholder:text-white/50" 
                />
              </div>
              <Select value={destinationCityId} onValueChange={setDestinationCityId}>
                <SelectTrigger className="h-10 booking-input text-white border-[#D4AF37]/60 focus:border-[#F8D748] focus:ring-[#F8D748]">
                  <SelectValue placeholder="Selecione cidade" className="text-white/50" />
                </SelectTrigger>
                <SelectContent className="bg-[#002366] border border-[#D4AF37] text-white">
                  {cities.filter(city => city.is_active !== false).map(city => (
                    <SelectItem key={city.id} value={city.id} className="hover:bg-white/10 text-white">
                      {formatCityLabel(city)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button 
            onClick={goToNextStep} 
            disabled={!canProceedFromStep1()} 
            className="px-3 py-2 h-auto md:px-6 rounded-lg text-[#002366] font-medium md:h-10 transition-all duration-300 
                      shadow-xl hover:shadow-2xl relative overflow-hidden bg-gradient-to-r from-amber-400 to-amber-300 
                      hover:from-amber-300 hover:to-amber-200 border border-amber-300 flex items-center"
          >
            <span className="mr-1">Continuar</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepTransition>
  );
};

export default RouteSelectionStep;
