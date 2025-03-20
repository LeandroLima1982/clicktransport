
import React from 'react';
import { Check, Users } from 'lucide-react';

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
  onSelectVehicle: (id: string) => void;
  formatCurrency: (value: number) => string;
  isLoading?: boolean;
}

const VehicleSelection: React.FC<VehicleSelectionProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  formatCurrency,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-500">Carregando opções de veículos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Escolha seu veículo</h3>
      
      <div className="space-y-3">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary ${
              selectedVehicle === vehicle.id ? 'border-primary bg-primary/5' : 'border-gray-200'
            }`}
            onClick={() => onSelectVehicle(vehicle.id)}
          >
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="md:w-1/3 mb-4 md:mb-0 md:mr-4">
                <img src={vehicle.image} alt={vehicle.name} className="rounded-md w-full h-32 object-cover" />
              </div>
              
              <div className="md:w-2/3 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-lg">{vehicle.name}</h4>
                  {selectedVehicle === vehicle.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                
                <p className="text-gray-600 mb-3">{vehicle.description}</p>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{vehicle.capacity}</span>
                      <span className="text-gray-500"> pessoas</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="text-sm text-gray-500 mb-1">Base</div>
                    <div className="font-medium">{formatCurrency(vehicle.basePrice)}</div>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="text-sm text-gray-500 mb-1">Por Km</div>
                    <div className="font-medium">{formatCurrency(vehicle.pricePerKm)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleSelection;
