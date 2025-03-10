
import React from 'react';
import { Label } from "@/components/ui/label";

interface Vehicle {
  id: string;
  model: string;
  license_plate: string;
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
          <option key={vehicle.id} value={vehicle.id}>
            {vehicle.model} ({vehicle.license_plate})
          </option>
        ))}
      </select>
    </div>
  );
};

export default VehicleSelector;
