
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
        <h3 className="text-lg font-semibold text-white">Escolha o veículo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden bg-[#002366]/70 border-amber-300/30">
              <Skeleton className="h-52 w-full" />
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
      <h3 className="text-lg font-semibold text-white">Escolha o veículo</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <Card 
            key={vehicle.id}
            className={`cursor-pointer transition-all hover:shadow-md overflow-hidden border-2 
              ${selectedVehicle === vehicle.id 
              ? 'ring-2 ring-amber-400 border-amber-400 bg-[#002366]/80' 
              : 'border-amber-300/30 hover:border-amber-200 bg-[#002366]/70'}`}
            onClick={() => onSelectVehicle(vehicle.id)}
          >
            <div className="relative h-52 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
              {vehicle.image && (
                <div 
                  className="absolute w-full h-full bg-gray-800"
                  style={{
                    backgroundImage: `url(${vehicle.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              )}
              {selectedVehicle === vehicle.id && (
                <div className="absolute top-2 right-2 bg-amber-400 text-[#002366] p-1 rounded-full z-20">
                  <CheckCheck className="w-5 h-5" />
                </div>
              )}
            </div>
            <CardHeader className="py-3 bg-gradient-to-r from-[#001a4d]/80 to-[#002366]/80 text-white">
              <CardTitle className="text-lg text-amber-300">{vehicle.name}</CardTitle>
              <CardDescription className="text-white/80">{vehicle.description}</CardDescription>
            </CardHeader>
            <CardContent className="py-3 bg-gradient-to-r from-[#001a4d]/80 to-[#002366]/80 text-white">
              <div className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4 text-amber-300" />
                <span>Até {vehicle.capacity} passageiros</span>
              </div>
              {/* Base price is now hidden in the selection step */}
              <div className="text-xs text-amber-200/80 mt-2">
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
