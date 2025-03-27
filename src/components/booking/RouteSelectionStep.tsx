
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRightCircle } from 'lucide-react';
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
  formatCityLabel
}) => {
  return (
    <StepTransition step={currentStep} direction={direction}>
      <div className="space-y-5 md:space-y-6">
        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          <div className="booking-input-container p-3 hover:bg-white/20 transition-colors duration-200 shadow-lg input-shadow">
            <Label className="block text-sm font-semibold booking-label mb-2">
              De onde vai sair?
            </Label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <MapPin className="h-4 w-4 text-[#F8D748]" />
                  </div>
                  <Input 
                    placeholder="Digite seu endereço: rua, número, bairro" 
                    value={originValue} 
                    onChange={handleManualOriginChange} 
                    className="pl-9 pr-3 py-2.5 text-sm booking-input h-10 focus:border-[#F8D748] focus:ring-[#F8D748] placeholder:text-white/50" 
                  />
                </div>
              </div>
              <div className="w-full sm:w-[180px]">
                <div className="flex">
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
            </div>
          </div>

          <div className="booking-input-container p-3 hover:bg-white/20 transition-colors duration-200 shadow-lg input-shadow">
            <Label className="block text-sm font-semibold booking-label mb-2">
              Para onde vai?
            </Label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <MapPin className="h-4 w-4 text-[#F8D748]" />
                  </div>
                  <Input 
                    placeholder="Digite seu destino: rua, número, bairro" 
                    value={destinationValue} 
                    onChange={handleManualDestinationChange} 
                    className="pl-9 pr-3 py-2.5 text-sm booking-input h-10 focus:border-[#F8D748] focus:ring-[#F8D748] placeholder:text-white/50" 
                  />
                </div>
              </div>
              <div className="w-full sm:w-[180px]">
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
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={goToNextStep} 
            disabled={!canProceedFromStep1()} 
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

export default RouteSelectionStep;
