
import { useState } from 'react';

interface City {
  id: string;
  name: string;
  state: string;
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
          { id: '1', name: 'São Paulo', state: 'SP' },
          { id: '2', name: 'Rio de Janeiro', state: 'RJ' },
          { id: '3', name: 'Belo Horizonte', state: 'MG' },
          { id: '4', name: 'Salvador', state: 'BA' },
          { id: '5', name: 'Brasília', state: 'DF' },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setLoading(false);
    }
  };

  return {
    cities,
    loading,
    fetchCities
  };
};

export default useDestinationsService;
