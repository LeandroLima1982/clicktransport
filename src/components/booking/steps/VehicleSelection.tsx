
import React, { useEffect, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Users, Compass, Loader2 } from 'lucide-react';
import { getVehicleRates, VehicleRate } from '@/utils/routeUtils';

export interface Vehicle {
  id: string;
  name: string;
  image: string;
  description: string;
  capacity: number;
  pricePerKm: number;
  basePrice: number;
}

interface VehicleSelectionProps {
  vehicles: Vehicle[];
  selectedVehicle: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  formatCurrency: (value: number) => string;
}

const VehicleSelection: React.FC<VehicleSelectionProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  formatCurrency
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [vehiclesWithRates, setVehiclesWithRates] = useState<Vehicle[]>(vehicles);

  useEffect(() => {
    const updateVehicleRates = async () => {
      setIsLoading(true);
      try {
        // Get the latest rates from the database
        const rates = await getVehicleRates();
        
        // Update the vehicles with the latest rates
        const updatedVehicles = vehicles.map(vehicle => {
          const rate = rates.find(r => r.id === vehicle.id);
          if (rate) {
            return {
              ...vehicle,
              basePrice: rate.basePrice,
              pricePerKm: rate.pricePerKm
            };
          }
          return vehicle;
        });
        
        setVehiclesWithRates(updatedVehicles);
      } catch (error) {
        console.error('Error updating vehicle rates:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    updateVehicleRates();
  }, [vehicles]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Carregando opções de veículos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Selecione um veículo para sua viagem</h3>
      
      <RadioGroup 
        value={selectedVehicle || ""} 
        onValueChange={(value) => onSelectVehicle(value)}
      >
        <div className="grid grid-cols-1 gap-4">
          {vehiclesWithRates.map((vehicle) => (
            <div key={vehicle.id} className="relative">
              <RadioGroupItem
                value={vehicle.id}
                id={`vehicle-${vehicle.id}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`vehicle-${vehicle.id}`}
                className="flex flex-col md:flex-row gap-4 items-center border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-blue-50"
              >
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name}
                  className="w-full md:w-32 h-auto object-cover rounded-md"
                />
                
                <div className="flex-1 space-y-2">
                  <div className="font-medium text-lg">{vehicle.name}</div>
                  <p className="text-gray-500 text-sm">{vehicle.description}</p>
                  
                  <div className="flex flex-row gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{vehicle.capacity} passageiros</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Compass className="h-4 w-4 text-gray-400" />
                      <span>{formatCurrency(vehicle.pricePerKm)}/km</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium text-lg text-primary">{formatCurrency(vehicle.basePrice)}</div>
                  <div className="text-xs text-gray-500">preço base</div>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
      
      {!selectedVehicle && (
        <div className="text-sm text-orange-500 mt-2">
          Por favor, selecione um veículo para continuar.
        </div>
      )}
    </div>
  );
};

export default VehicleSelection;
