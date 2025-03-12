
import React from 'react';
import { Check } from 'lucide-react';

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
  onSelectVehicle: (id: number) => void;
  formatCurrency: (value: number) => string;
}

const VehicleSelection: React.FC<VehicleSelectionProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {vehicles.map((vehicle) => (
        <div
          key={vehicle.id}
          className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
            selectedVehicle === vehicle.id ? 'border-primary bg-primary/5' : 'border-gray-200'
          }`}
          onClick={() => onSelectVehicle(vehicle.id)}
        >
          <div className="relative">
            <img
              src={vehicle.image} 
              alt={vehicle.name}
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            {selectedVehicle === vehicle.id && (
              <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full">
                <Check className="h-5 w-5" />
              </div>
            )}
          </div>
          <h3 className="font-bold text-lg">{vehicle.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{vehicle.description}</p>
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm">Capacidade: {vehicle.capacity} pessoas</span>
            <span className="font-semibold text-primary">A partir de {formatCurrency(vehicle.basePrice)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VehicleSelection;
