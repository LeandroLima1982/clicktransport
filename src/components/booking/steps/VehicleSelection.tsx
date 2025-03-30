
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
        return <Car className="h-20 w-20 text-primary" />;
      case 'suv':
        return <CarTaxiFront className="h-20 w-20 text-primary" />;
      case 'van':
        return <Bus className="h-20 w-20 text-primary" />;
      case 'truck':
        return <Truck className="h-20 w-20 text-primary" />;
      case 'motorcycle':
        return <Bike className="h-20 w-20 text-primary" />;
      case 'tractor':
        return <Tractor className="h-20 w-20 text-primary" />;
      default:
        return <Car className="h-20 w-20 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-6">Escolha seu veículo</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className={`border rounded-xl p-6 cursor-pointer transition-all hover:border-primary hover:shadow-lg ${
              selectedVehicle === vehicle.id ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-200'
            }`}
            onClick={() => onSelectVehicle(vehicle.id)}
          >
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-xl">{vehicle.name}</h4>
                {selectedVehicle === vehicle.id && (
                  <Check className="h-6 w-6 text-primary" />
                )}
              </div>
              
              <div className="flex justify-center items-center bg-gray-50 rounded-lg p-4 h-48 overflow-hidden">
                {vehicleImages[vehicle.id] ? (
                  <img 
                    src={vehicleImages[vehicle.id]} 
                    alt={vehicle.name}
                    className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  getVehicleIcon(vehicle.id)
                )}
              </div>
              
              <p className="text-gray-600 my-3 text-center">{vehicle.description}</p>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg text-center shadow-sm">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{vehicle.capacity}</span>
                    <span className="text-gray-500"> pessoas</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg text-center shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Base</div>
                  <div className="font-medium">{formatCurrency(vehicle.basePrice)}</div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg text-center shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Por Km</div>
                  <div className="font-medium">{formatCurrency(vehicle.pricePerKm)}</div>
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
