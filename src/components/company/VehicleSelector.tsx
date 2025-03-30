
import React, { useEffect, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Car, Bus, Truck, Tractor, CarTaxiFront, Bike } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Vehicle {
  id: string;
  model: string;
  license_plate: string;
  type?: string;
  capacity?: number;
}

interface VehicleCategory {
  id: string;
  name: string;
  capacity: number;
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
  const [vehicleCategories, setVehicleCategories] = useState<Record<string, VehicleCategory>>({});
  
  useEffect(() => {
    const loadVehicleCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('vehicle_rates')
          .select('id, name, capacity');
        
        if (error) {
          console.error('Error loading vehicle categories:', error);
          return;
        }
        
        if (data) {
          const categoriesMap: Record<string, VehicleCategory> = {};
          data.forEach((category: any) => {
            categoriesMap[category.id] = {
              id: category.id,
              name: category.name,
              capacity: category.capacity || 4
            };
          });
          setVehicleCategories(categoriesMap);
        }
      } catch (err) {
        console.error('Failed to load vehicle categories:', err);
      }
    };
    
    loadVehicleCategories();
  }, []);

  // Função para determinar qual ícone exibir baseado no tipo do veículo
  const getVehicleIcon = (type?: string, size: number = 16) => {
    switch(type?.toLowerCase()) {
      case 'sedan':
      case 'hatch':
      case 'coupe':
        return <Car className={`h-${size} w-${size} text-gray-700 inline-block mr-2`} />;
      case 'suv':
      case 'van':
        return <CarTaxiFront className={`h-${size} w-${size} text-gray-700 inline-block mr-2`} />;
      case 'bus':
        return <Bus className={`h-${size} w-${size} text-gray-700 inline-block mr-2`} />;
      case 'truck':
        return <Truck className={`h-${size} w-${size} text-gray-700 inline-block mr-2`} />;
      case 'tractor':
        return <Tractor className={`h-${size} w-${size} text-gray-700 inline-block mr-2`} />;
      case 'motorcycle':
        return <Bike className={`h-${size} w-${size} text-gray-700 inline-block mr-2`} />;
      default:
        return <Car className={`h-${size} w-${size} text-gray-700 inline-block mr-2`} />;
    }
  };

  const getVehicleCapacity = (vehicle: Vehicle) => {
    if (vehicle.type && vehicleCategories[vehicle.type]) {
      return vehicleCategories[vehicle.type].capacity;
    }
    return vehicle.capacity || 4; // Default fallback
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label htmlFor="vehicle-selector">{label}</Label>}
      <select
        id="vehicle-selector"
        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
        <div className="mt-3 text-sm text-gray-600 flex items-center justify-start p-4 bg-gray-50 rounded-lg shadow-sm">
          <div className="mr-4 flex justify-center items-center bg-primary/10 p-3 rounded-full">
            {getVehicleIcon(vehicles.find(v => v.id === selectedVehicleId)?.type, 6)}
          </div>
          <div className="flex flex-col">
            <span className="font-medium">
              {vehicles.find(v => v.id === selectedVehicleId)?.model} ({vehicles.find(v => v.id === selectedVehicleId)?.license_plate})
            </span>
            {vehicles.find(v => v.id === selectedVehicleId) && (
              <span className="text-xs text-gray-500 mt-1">
                Capacidade: {getVehicleCapacity(vehicles.find(v => v.id === selectedVehicleId)!)} passageiros
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleSelector;
