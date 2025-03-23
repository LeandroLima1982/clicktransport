
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface City {
  id: string;
  name: string;
  state: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface CityInput {
  name: string;
  state?: string;
  country?: string;
  latitude: number;
  longitude: number;
  is_active?: boolean;
}

export const cityService = {
  async getAllCities() {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return data as City[];
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  },
  
  async getActiveCities() {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      
      return data as City[];
    } catch (error) {
      console.error('Error fetching active cities:', error);
      throw error;
    }
  },
  
  async getCityById(id: string) {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as City;
    } catch (error) {
      console.error('Error fetching city:', error);
      throw error;
    }
  },
  
  async createCity(city: CityInput) {
    try {
      const { data, error } = await supabase
        .from('cities')
        .insert([city])
        .select()
        .single();
      
      if (error) throw error;
      
      return data as City;
    } catch (error) {
      console.error('Error creating city:', error);
      throw error;
    }
  },
  
  async updateCity(id: string, city: Partial<CityInput>) {
    try {
      const { data, error } = await supabase
        .from('cities')
        .update(city)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as City;
    } catch (error) {
      console.error('Error updating city:', error);
      throw error;
    }
  },
  
  async deleteCity(id: string) {
    try {
      const { error } = await supabase
        .from('cities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting city:', error);
      throw error;
    }
  },
  
  async toggleCityStatus(id: string, isActive: boolean) {
    try {
      const { data, error } = await supabase
        .from('cities')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as City;
    } catch (error) {
      console.error('Error toggling city status:', error);
      throw error;
    }
  },
  
  // Calculate distance between two cities using their coordinates
  calculateDistance(originLat: number, originLng: number, destLat: number, destLng: number) {
    // Haversine formula to calculate distance between two points on Earth
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(destLat - originLat);
    const dLon = this.deg2rad(destLng - originLng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(originLat)) * Math.cos(this.deg2rad(destLat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  },
  
  deg2rad(deg: number) {
    return deg * (Math.PI/180);
  }
};

export default cityService;
