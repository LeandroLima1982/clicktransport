
import { useState } from 'react';
import { enhanceDestinationsService } from '@/utils/mapbox';

export interface City {
  id: string;
  name: string;
  state: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
}

export const useDestinationsService = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCities = async () => {
    setLoading(true);
    try {
      // This would normally fetch from an API
      // Simulating fetch for now
      setTimeout(() => {
        setCities([
          { 
            id: '1', 
            name: 'São Paulo', 
            state: 'SP', 
            country: 'Brasil',
            latitude: -23.5505,
            longitude: -46.6333,
            is_active: true
          },
          { 
            id: '2', 
            name: 'Rio de Janeiro', 
            state: 'RJ',
            country: 'Brasil',
            latitude: -22.9068,
            longitude: -43.1729,
            is_active: true
          },
          { 
            id: '3', 
            name: 'Belo Horizonte', 
            state: 'MG',
            country: 'Brasil',
            latitude: -19.9167,
            longitude: -43.9345,
            is_active: true
          },
          { 
            id: '4', 
            name: 'Salvador', 
            state: 'BA',
            country: 'Brasil',
            latitude: -12.9714,
            longitude: -38.5014,
            is_active: true
          },
          { 
            id: '5', 
            name: 'Brasília', 
            state: 'DF',
            country: 'Brasil',
            latitude: -15.7801,
            longitude: -47.9292,
            is_active: true
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setLoading(false);
    }
  };

  // Create the base service with the minimal functionality
  const baseService = {
    cities,
    loading,
    fetchCities
  };

  // Enhance it with additional functions needed by some components
  return enhanceDestinationsService(baseService);
};

export default useDestinationsService;
