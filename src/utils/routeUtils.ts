
import { calculateRoute, geocodeAddress, loadGoogleMapsScript } from './googleMaps';
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

// Main function is now a simple wrapper around the googleMaps function
export { calculateRoute };

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
    
    // Default values if no data in the database
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
    // Default values for backup calculation
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
