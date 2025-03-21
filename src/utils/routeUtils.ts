
import { GOOGLE_MAPS_API_KEY, calculateRoute as googleCalculateRoute } from './googlemaps';
import { supabase } from '@/integrations/supabase/client';

export interface RouteInfo {
  distance: number; // in kilometers
  duration: number; // in minutes
  geometry?: any;
}

export interface VehicleRate {
  id: string;
  name: string;
  basePrice: number;
  pricePerKm: number;
}

export const calculateRoute = async (
  origin: string,
  destination: string
): Promise<RouteInfo | null> => {
  try {
    // Use Google Maps for route calculation
    const route = await googleCalculateRoute(origin, destination);
    return route;
  } catch (error) {
    console.error('Error calculating route:', error);
    return null;
  }
};

export const getVehicleRates = async (): Promise<VehicleRate[]> => {
  try {
    const { data, error } = await supabase
      .from('vehicle_rates')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching vehicle rates:', error);
      throw error;
    }
    
    if (data && data.length > 0) {
      // Map database column names to our interface
      return data.map(item => ({
        id: item.id,
        name: item.name,
        basePrice: item.baseprice,
        pricePerKm: item.priceperkm
      }));
    }
    
    // Se não houver dados no banco, retorne valores padrão atualizados
    return [
      { id: 'sedan', name: 'Sedan Executivo', basePrice: 79.90, pricePerKm: 2.10 },
      { id: 'suv', name: 'SUV Premium', basePrice: 119.90, pricePerKm: 2.49 },
      { id: 'van', name: 'Van Executiva', basePrice: 199.90, pricePerKm: 3.39 }
    ];
  } catch (error) {
    console.error('Error in getVehicleRates:', error);
    // Return default values on error
    return [
      { id: 'sedan', name: 'Sedan Executivo', basePrice: 79.90, pricePerKm: 2.10 },
      { id: 'suv', name: 'SUV Premium', basePrice: 119.90, pricePerKm: 2.49 },
      { id: 'van', name: 'Van Executiva', basePrice: 199.90, pricePerKm: 3.39 }
    ];
  }
};

export const calculateTripPrice = async (
  distance: number,
  vehicleTypeId: string = 'sedan',
  isRoundTrip: boolean = false
): Promise<number> => {
  try {
    const vehicleRates = await getVehicleRates();
    
    const vehicleRate = vehicleRates.find(rate => rate.id === vehicleTypeId) || vehicleRates[0];
    
    const distancePrice = distance * vehicleRate.pricePerKm;
    const totalPrice = vehicleRate.basePrice + distancePrice;
    
    return isRoundTrip ? totalPrice * 2 : totalPrice;
  } catch (error) {
    console.error('Error calculating trip price:', error);
    // Valores padrão atualizados para cálculo de backup
    const basePrice = 79.90;
    const pricePerKm = 2.10;
    
    const distancePrice = distance * pricePerKm;
    const totalPrice = basePrice + distancePrice;
    
    return isRoundTrip ? totalPrice * 2 : totalPrice;
  }
};

export const calculateTripPriceSync = (
  distance: number,
  basePrice: number,
  pricePerKm: number = 2.10,
  isRoundTrip: boolean = false
): number => {
  const distancePrice = distance * pricePerKm;
  const totalPrice = basePrice + distancePrice;
  
  return isRoundTrip ? totalPrice * 2 : totalPrice;
};

export const formatTravelTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}min`;
  }
};
