
import React from 'react';
import { Button } from '@/components/ui/button';
import StepTransition from './StepTransition';
import { Car, Users, Zap } from 'lucide-react';

interface Vehicle {
  id: string;
  name: string;
  description: string;
  image: string;
  capacity: number;
  pricePerKm: number;
  basePrice: number;
}

interface VehicleSelectionStepProps {
  selectedVehicle: string | null;
  setSelectedVehicle: (vehicleId: string) => void;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
  canProceedFromStep4: () => boolean;
  direction: number;
  currentStep: number;
  distanceInfo: { distance: number; duration: number } | null;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const VehicleSelectionStep: React.FC<VehicleSelectionStepProps> = ({
  selectedVehicle,
  setSelectedVehicle,
  goToPreviousStep,
  goToNextStep,
  canProceedFromStep4,
  direction,
  currentStep,
  distanceInfo,
  isFirstStep,
  isLastStep
}) => {
  const vehicles: Vehicle[] = [
    {
      id: "sedan",
      name: 'Sedan Executivo',
      description: 'Conforto para até 4 passageiros',
      image: '/lovable-uploads/sedan-exec.jpg',
      capacity: 4,
      pricePerKm: 2.10,
      basePrice: 79.90,
    },
    {
      id: "suv",
      name: 'SUV Premium',
      description: 'Espaço e conforto para até 6 passageiros',
      image: '/lovable-uploads/suv-premium.jpg',
      capacity: 6,
      pricePerKm: 2.49,
      basePrice: 119.90,
    },
    {
      id: "van",
      name: 'Van Executiva',
      description: 'Ideal para grupos de até 15 passageiros',
      image: '/lovable-uploads/van-exec.jpg',
      capacity: 15,
      pricePerKm: 3.39,
      basePrice: 199.90,
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateTripPrice = (vehicle: Vehicle) => {
    if (!distanceInfo) return vehicle.basePrice;
    return vehicle.basePrice + (vehicle.pricePerKm * distanceInfo.distance);
  };

  return (
    <StepTransition step={currentStep} direction={direction}>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-2 text-center">Escolha o Veículo</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {vehicles.map(vehicle => (
            <div 
              key={vehicle.id}
              onClick={() => setSelectedVehicle(vehicle.id)}
              className={`booking-input-container p-2 hover:bg-white/20 transition-colors cursor-pointer 
                        rounded-lg overflow-hidden shadow-lg input-shadow relative ${
                          selectedVehicle === vehicle.id ? 'ring-2 ring-amber-400 bg-white/10' : ''
                        }`}
            >
              <div className="h-24 bg-gray-200 rounded-t-lg overflow-hidden">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-2">
                <h4 className="font-medium text-white">{vehicle.name}</h4>
                <div className="flex items-center text-white/90 text-xs mt-1">
                  <Users className="w-3 h-3 mr-1" />
                  <span>Até {vehicle.capacity} passageiros</span>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="text-amber-300 font-bold">
                    {formatCurrency(calculateTripPrice(vehicle))}
                  </div>
                  <div className="text-white/70 text-xs flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    {formatCurrency(vehicle.pricePerKm)}/km
                  </div>
                </div>
              </div>
              
              {selectedVehicle === vehicle.id && (
                <div className="absolute top-2 right-2 bg-amber-400 rounded-full p-1">
                  <Car className="w-3 h-3 text-[#002366]" />
                </div>
              )}
            </div>
          ))}
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
            disabled={!canProceedFromStep4()}
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

export default VehicleSelectionStep;
