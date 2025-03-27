
import React from 'react';
import { Loader2, CheckCircle, Users } from 'lucide-react';

export interface Vehicle {
  id: string;
  name: string;
  image: string;
  description: string;
  capacity: number;
  basePrice: number;
  pricePerKm: number;
}

interface VehicleSelectionProps {
  vehicles: Vehicle[];
  selectedVehicle: string | null;
  onSelectVehicle: (id: string) => void;
  formatCurrency: (value: number) => string;
  isLoading: boolean;
}

const VehicleSelection: React.FC<VehicleSelectionProps> = ({ 
  vehicles, 
  selectedVehicle, 
  onSelectVehicle,
  formatCurrency,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <div className="text-gray-500">Carregando opções de veículos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Escolha o veículo</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className={`
              relative rounded-lg overflow-hidden border transition-all duration-200 cursor-pointer
              hover:shadow-md hover:border-primary/50
              ${selectedVehicle === vehicle.id 
                ? 'border-primary shadow-sm' 
                : 'border-gray-200'
              }
            `}
            onClick={() => onSelectVehicle(vehicle.id)}
          >
            {/* Selected indicator */}
            {selectedVehicle === vehicle.id && (
              <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 z-10">
                <CheckCircle className="h-5 w-5" />
              </div>
            )}
            
            {/* Vehicle Image */}
            <div className="h-36 bg-gray-100">
              <img 
                src={vehicle.image} 
                alt={vehicle.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to a default image if loading fails
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=Veículo+indisponível";
                }}
              />
            </div>
            
            {/* Vehicle Details */}
            <div className="p-4">
              <div className="font-medium text-lg">{vehicle.name}</div>
              <div className="text-sm text-gray-500 mt-1 flex items-center">
                <Users className="h-4 w-4 mr-1 inline" />
                <span>até {vehicle.capacity} passageiros</span>
              </div>
              <div className="mt-4 flex justify-between items-end">
                <div>
                  <div className="text-xs text-gray-500">A partir de</div>
                  <div className="text-primary font-semibold">{formatCurrency(vehicle.basePrice)}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {formatCurrency(vehicle.pricePerKm)}/km
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
