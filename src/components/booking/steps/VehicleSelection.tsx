
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCheck } from 'lucide-react';

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
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Escolha o veículo</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <Card 
            key={vehicle.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedVehicle === vehicle.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectVehicle(vehicle.id)}
          >
            <div className="relative h-40 overflow-hidden rounded-t-lg">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
              <div 
                className="absolute w-full h-full bg-gray-200"
                style={{
                  backgroundImage: `url(${vehicle.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              {selectedVehicle === vehicle.id && (
                <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full z-20">
                  <CheckCheck className="w-4 h-4" />
                </div>
              )}
            </div>
            <CardHeader className="py-3">
              <CardTitle className="text-lg">{vehicle.name}</CardTitle>
              <CardDescription>{vehicle.description}</CardDescription>
            </CardHeader>
            <CardContent className="py-2">
              <div className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4" />
                <span>Até {vehicle.capacity} passageiros</span>
              </div>
              <div className="mt-4 font-bold text-lg text-primary">
                {formatCurrency(vehicle.basePrice)}
              </div>
              <div className="text-xs text-gray-500">
                + {formatCurrency(vehicle.pricePerKm)}/km
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VehicleSelection;
