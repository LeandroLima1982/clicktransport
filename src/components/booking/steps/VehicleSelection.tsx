
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCheck, Battery, Clock, MapPin } from 'lucide-react';
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
      <h3 className={`text-lg font-semibold ${isMobile ? 'text-white' : ''}`}>Escolha o veículo</h3>
      
      {isMobile ? (
        // App-like UI for mobile based on reference image
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <div 
              key={vehicle.id}
              className="vehicle-card"
              onClick={() => onSelectVehicle(vehicle.id)}
            >
              <div className="vehicle-header">
                <div className="vehicle-name">{vehicle.name}</div>
                {/* License plate (ID used as placeholder) */}
                <div className="vehicle-plate">
                  {`F${vehicle.id}${vehicle.id * 12}KL`}
                </div>
              </div>
              
              <div className="vehicle-image-container">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name}
                  className="vehicle-image"
                />
                {selectedVehicle === vehicle.id && (
                  <div className="absolute top-2 right-2 bg-[#F8D748] text-[#1F1F1F] p-1 rounded-full">
                    <CheckCheck className="w-5 h-5" />
                  </div>
                )}
              </div>
              
              <div className="journey-info">
                <div className="journey-location">
                  <div className="location-dot origin"></div>
                  <div className="location-text">
                    <div className="location-name">Ponto de partida</div>
                    <div className="location-time">08:00 (estimado)</div>
                  </div>
                </div>
                
                <div className="journey-location">
                  <div className="location-dot destination"></div>
                  <div className="location-text">
                    <div className="location-name">Destino</div>
                    <div className="location-time">08:30 (estimado)</div>
                  </div>
                </div>
                
                <div className="journey-stats">
                  <div className="stat">
                    <Users className="h-4 w-4 text-[#F8D748]" />
                    <span className="stat-value">{vehicle.capacity}</span>
                  </div>
                  
                  <div className="stat">
                    <MapPin className="h-4 w-4 text-[#F8D748]" />
                    <span className="stat-value">15 km</span>
                  </div>
                  
                  <div className="stat">
                    <Clock className="h-4 w-4 text-[#F8D748]" />
                    <span className="stat-value">30 min</span>
                  </div>
                  
                  <div className="font-bold text-[#F8D748]">
                    {formatCurrency(vehicle.basePrice)}
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
