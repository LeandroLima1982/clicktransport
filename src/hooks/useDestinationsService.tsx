
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define TypeScript interfaces
interface City {
  id: string;
  name: string;
  state?: string;
  country?: string;
  latitude: number;
  longitude: number;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

interface CityDistance {
  id: string;
  origin_id: string;
  destination_id: string;
  distance: number;
  duration: number;
  created_at: string;
  updated_at?: string;
}

export const useDestinationsService = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name');
      
      if (error) throw new Error(error.message);
      
      setCities(data || []);
    } catch (err) {
      console.error('Error fetching cities:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch cities'));
    } finally {
      setLoading(false);
    }
  }, []);

  const addCity = async (cityData: Omit<City, 'id' | 'created_at'>) => {
    try {
      // Remover o ID se for uma nova cidade
      const { id, ...cityDataWithoutId } = cityData as any;
      
      const { data, error } = await supabase
        .from('cities')
        .insert([cityDataWithoutId])
        .select();
      
      if (error) throw new Error(error.message);
      
      // Atualizar a lista de cidades
      setCities(prevCities => [...prevCities, data[0]]);
      
      return data[0];
    } catch (err) {
      console.error('Error adding city:', err);
      throw err;
    }
  };

  const updateCity = async (cityData: City) => {
    try {
      if (!cityData.id) throw new Error('City ID is required for update');
      
      const { data, error } = await supabase
        .from('cities')
        .update(cityData)
        .eq('id', cityData.id)
        .select();
      
      if (error) throw new Error(error.message);
      
      // Atualizar a lista de cidades
      setCities(prevCities => 
        prevCities.map(city => 
          city.id === cityData.id ? data[0] : city
        )
      );
      
      return data[0];
    } catch (err) {
      console.error('Error updating city:', err);
      throw err;
    }
  };

  const deleteCity = async (cityId: string) => {
    try {
      const { error } = await supabase
        .from('cities')
        .delete()
        .eq('id', cityId);
      
      if (error) throw new Error(error.message);
      
      // Atualizar a lista de cidades
      setCities(prevCities => 
        prevCities.filter(city => city.id !== cityId)
      );
      
      return true;
    } catch (err) {
      console.error('Error deleting city:', err);
      throw err;
    }
  };

  // Função para buscar distância entre cidades
  const getDistanceBetweenCities = async (originId: string, destinationId: string) => {
    try {
      const originCity = cities.find(city => city.id === originId);
      const destinationCity = cities.find(city => city.id === destinationId);
      
      if (!originCity || !destinationCity) {
        throw new Error('Cidades não encontradas');
      }
      
      // Verifica se já existe um registro de distância entre essas cidades
      const { data, error } = await supabase
        .from('city_distances')
        .select('*')
        .or(`and(origin_id.eq.${originId},destination_id.eq.${destinationId}),and(origin_id.eq.${destinationId},destination_id.eq.${originId})`)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
        throw new Error(error.message);
      }
      
      if (data) {
        return {
          distance: data.distance,
          duration: data.duration,
          exists: true
        };
      }
      
      // Se não existe, retorna null
      return null;
    } catch (err) {
      console.error('Error getting distance between cities:', err);
      throw err;
    }
  };

  return {
    cities,
    loading,
    error,
    fetchCities,
    addCity,
    updateCity,
    deleteCity,
    getDistanceBetweenCities
  };
};
