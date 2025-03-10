
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCheck, Battery, Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Escolha o veículo</h3>
      
      {isMobile ? (
        // App-like UI for mobile
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <div 
              key={vehicle.id}
              className={`app-card overflow-hidden ${
                selectedVehicle === vehicle.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onSelectVehicle(vehicle.id)}
            >
              <div className="flex items-center p-4">
                <div 
                  className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 mr-4 flex-shrink-0"
                  style={{
                    backgroundImage: `url(${vehicle.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-base">{vehicle.name}</h4>
                      <p className="text-gray-500 text-sm line-clamp-1">{vehicle.description}</p>
                    </div>
                    {selectedVehicle === vehicle.id && (
                      <div className="bg-primary rounded-full p-1 flex-shrink-0">
                        <CheckCheck className="text-white w-4 h-4" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-xs text-gray-600">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{vehicle.capacity}</span>
                      <Battery className="h-3 w-3 ml-3 mr-1" />
                      <span>100%</span>
                      <Clock className="h-3 w-3 ml-3 mr-1" />
                      <span>Rápido</span>
                    </div>
                    <div className="font-bold text-primary">
                      {formatCurrency(vehicle.basePrice)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Original grid layout for larger screens
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
      )}
    </div>
  );
};

export default VehicleSelection;
