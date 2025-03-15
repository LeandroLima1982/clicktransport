
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Users, Compass } from 'lucide-react';

export interface Vehicle {
  id: number;
  name: string;
  image: string;
  description: string;
  capacity: number;
  pricePerKm: number;
  basePrice: number;
}

interface VehicleSelectionProps {
  vehicles: Vehicle[];
  selectedVehicle: number | null;
  onSelectVehicle: (vehicleId: number) => void;
  formatCurrency: (value: number) => string;
}

const VehicleSelection: React.FC<VehicleSelectionProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  formatCurrency
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Selecione um veículo para sua viagem</h3>
      
      <RadioGroup 
        value={selectedVehicle?.toString() || ""} 
        onValueChange={(value) => onSelectVehicle(parseInt(value))}
      >
        <div className="grid grid-cols-1 gap-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="relative">
              <RadioGroupItem
                value={vehicle.id.toString()}
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
