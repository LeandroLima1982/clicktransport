
import React from 'react';
import { Label } from "@/components/ui/label";
import { Car, Bus, Truck, Tractor, CarTaxiFront, Bike } from 'lucide-react';

interface Vehicle {
  id: string;
  model: string;
  license_plate: string;
  type?: string;
}

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onChange: (vehicleId: string) => void;
  label?: string;
  className?: string;
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  vehicles,
  selectedVehicleId,
  onChange,
  label = "Veículo",
  className = ""
}) => {
  // Função para determinar qual ícone exibir baseado no tipo do veículo
  const getVehicleIcon = (type?: string) => {
    switch(type?.toLowerCase()) {
      case 'sedan':
      case 'hatch':
      case 'coupe':
        return <Car className="h-4 w-4 text-gray-700 inline-block mr-1" />;
      case 'suv':
      case 'van':
        return <CarTaxiFront className="h-4 w-4 text-gray-700 inline-block mr-1" />;
      case 'bus':
        return <Bus className="h-4 w-4 text-gray-700 inline-block mr-1" />;
      case 'truck':
        return <Truck className="h-4 w-4 text-gray-700 inline-block mr-1" />;
      case 'tractor':
        return <Tractor className="h-4 w-4 text-gray-700 inline-block mr-1" />;
      case 'motorcycle':
        return <Bike className="h-4 w-4 text-gray-700 inline-block mr-1" />;
      default:
        return <Car className="h-4 w-4 text-gray-700 inline-block mr-1" />;
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && <Label htmlFor="vehicle-selector">{label}</Label>}
      <select
        id="vehicle-selector"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={selectedVehicleId || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Não atribuído</option>
        {vehicles.map(vehicle => (
          <option key={vehicle.id} value={vehicle.id} className="flex items-center">
            {vehicle.model} ({vehicle.license_plate})
          </option>
        ))}
      </select>
      
      {selectedVehicleId && (
        <div className="mt-1 text-sm text-gray-500 flex items-center">
          {getVehicleIcon(vehicles.find(v => v.id === selectedVehicleId)?.type)}
          <span>
            {vehicles.find(v => v.id === selectedVehicleId)?.model} ({vehicles.find(v => v.id === selectedVehicleId)?.license_plate})
          </span>
        </div>
      )}
    </div>
  );
};

export default VehicleSelector;
