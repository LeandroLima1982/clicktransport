
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCheck, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Escolha o veículo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardHeader className="py-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardHeader>
              <CardContent className="py-2">
                <Skeleton className="h-4 w-1/2 mt-2" />
                <Skeleton className="h-5 w-1/3 mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Escolha o veículo</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <Card 
            key={vehicle.id}
            className={`cursor-pointer transition-all hover:shadow-md overflow-hidden border-2 
              ${selectedVehicle === vehicle.id 
              ? 'ring-2 ring-amber-400 border-amber-400' 
              : 'border-gray-200 hover:border-amber-200'}`}
            onClick={() => onSelectVehicle(vehicle.id)}
          >
            <div className="relative h-48 overflow-hidden rounded-t-lg">
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
                <div className="absolute top-2 right-2 bg-amber-400 text-[#002366] p-1 rounded-full z-20">
                  <CheckCheck className="w-5 h-5" />
                </div>
              )}
            </div>
            <CardHeader className="py-3 bg-gradient-to-r from-amber-50 to-amber-100/30">
              <CardTitle className="text-lg text-[#002366]">{vehicle.name}</CardTitle>
              <CardDescription>{vehicle.description}</CardDescription>
            </CardHeader>
            <CardContent className="py-3 bg-gradient-to-r from-amber-50 to-amber-100/30">
              <div className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4 text-amber-700" />
                <span>Até {vehicle.capacity} passageiros</span>
              </div>
              {/* Base price is now hidden in the selection step */}
              <div className="text-xs text-gray-500 mt-2">
                {formatCurrency(vehicle.pricePerKm)}/km
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VehicleSelection;
