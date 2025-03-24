
import React from 'react';
import { Check, Users, Car, CarTaxiFront, Bus, Truck, Bike, Tractor } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from 'react';

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
  onSelectVehicle: (id: string) => void;
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
  const [vehicleImages, setVehicleImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadVehicleImages = async () => {
      try {
        // Fetch vehicle images from site_images table
        const { data, error } = await supabase
          .from('site_images')
          .select('section_id, image_url')
          .in('section_id', vehicles.map(v => v.id));
        
        if (error) {
          console.error('Error loading vehicle images:', error);
          return;
        }
        
        if (data) {
          const images: Record<string, string> = {};
          data.forEach(item => {
            images[item.section_id] = item.image_url;
          });
          setVehicleImages(images);
          console.log('Loaded vehicle images:', images);
        }
      } catch (err) {
        console.error('Failed to load vehicle images:', err);
      }
    };

    if (vehicles.length > 0) {
      loadVehicleImages();
    }
  }, [vehicles]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-500">Carregando opções de veículos...</p>
      </div>
    );
  }

  // Função para obter o ícone apropriado para cada tipo de veículo
  const getVehicleIcon = (vehicleId: string) => {
    switch(vehicleId.toLowerCase()) {
      case 'sedan':
        return <Car className="h-16 w-16 text-primary" />;
      case 'suv':
        return <CarTaxiFront className="h-16 w-16 text-primary" />;
      case 'van':
        return <Bus className="h-16 w-16 text-primary" />;
      case 'truck':
        return <Truck className="h-16 w-16 text-primary" />;
      case 'motorcycle':
        return <Bike className="h-16 w-16 text-primary" />;
      case 'tractor':
        return <Tractor className="h-16 w-16 text-primary" />;
      default:
        return <Car className="h-16 w-16 text-primary" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Escolha seu veículo</h3>
      
      <div className="space-y-3">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary ${
              selectedVehicle === vehicle.id ? 'border-primary bg-primary/5' : 'border-gray-200'
            }`}
            onClick={() => onSelectVehicle(vehicle.id)}
          >
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="md:w-1/4 mb-4 md:mb-0 md:mr-4 flex justify-center items-center">
                <div className="flex items-center justify-center bg-gray-50 rounded-lg p-2 w-24 h-24 overflow-hidden">
                  {vehicleImages[vehicle.id] ? (
                    <img 
                      src={vehicleImages[vehicle.id]} 
                      alt={vehicle.name}
                      className="w-full h-full object-contain" 
                    />
                  ) : (
                    getVehicleIcon(vehicle.id)
                  )}
                </div>
              </div>
              
              <div className="md:w-3/4 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-lg">{vehicle.name}</h4>
                  {selectedVehicle === vehicle.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                
                <p className="text-gray-600 mb-3">{vehicle.description}</p>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{vehicle.capacity}</span>
                      <span className="text-gray-500"> pessoas</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="text-sm text-gray-500 mb-1">Base</div>
                    <div className="font-medium">{formatCurrency(vehicle.basePrice)}</div>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded text-center">
                    <div className="text-sm text-gray-500 mb-1">Por Km</div>
                    <div className="font-medium">{formatCurrency(vehicle.pricePerKm)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleSelection;
