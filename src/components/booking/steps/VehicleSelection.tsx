
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Loader2, CheckCheck } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <div className="text-gray-500">Buscando veículos disponíveis...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Escolha o Veículo</h3>
        <p className="text-sm text-gray-500">
          Selecione o veículo que melhor atende às suas necessidades
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {vehicles.map((vehicle) => (
          <Card 
            key={vehicle.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedVehicle === vehicle.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectVehicle(vehicle.id)}
          >
            <div className="flex items-center p-4 relative">
              <div 
                className="w-20 h-20 rounded-md bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden mr-4"
                style={{
                  backgroundImage: `url(${vehicle.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!vehicle.image && (
                  <Users className="h-10 w-10 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{vehicle.name}</h4>
                <p className="text-sm text-gray-500">{vehicle.description}</p>
                
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="mr-1 h-4 w-4" />
                    <span>Até {vehicle.capacity} passageiros</span>
                  </div>
                  
                  <div>
                    <div className="font-bold text-primary">{formatCurrency(vehicle.basePrice)}</div>
                    <div className="text-xs text-gray-500">+{formatCurrency(vehicle.pricePerKm)}/km</div>
                  </div>
                </div>
              </div>
              
              {selectedVehicle === vehicle.id && (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                  <CheckCheck className="w-4 h-4" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VehicleSelection;
