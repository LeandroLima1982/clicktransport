
import { MAPBOX_TOKEN } from './mapbox';
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
    // First, geocode the origin and destination to get coordinates
    const originCoords = await geocodeAddress(origin);
    const destinationCoords = await geocodeAddress(destination);

    if (!originCoords || !destinationCoords) {
      console.error('Failed to geocode one of the addresses');
      return null;
    }

    // Calculate the route between the coordinates
    const route = await getRouteInfo(originCoords, destinationCoords);
    return route;
  } catch (error) {
    console.error('Error calculating route:', error);
    return null;
  }
};

const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  if (!address || !MAPBOX_TOKEN) return null;

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&country=br&limit=1`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].center as [number, number];
    }

    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

const getRouteInfo = async (
  origin: [number, number],
  destination: [number, number]
): Promise<RouteInfo | null> => {
  if (!MAPBOX_TOKEN) return null;

  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`
    );

    if (!response.ok) {
      throw new Error(`Directions API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      // Convert distance from meters to kilometers
      const distanceKm = route.distance / 1000;
      
      // Convert duration from seconds to minutes
      const durationMin = Math.ceil(route.duration / 60);
      
      return {
        distance: parseFloat(distanceKm.toFixed(2)),
        duration: durationMin,
        geometry: route.geometry
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting route:', error);
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
    
    return [
      { id: 'sedan', name: 'Sedan Executivo', basePrice: 100, pricePerKm: 2.5 },
      { id: 'suv', name: 'SUV Premium', basePrice: 150, pricePerKm: 3.0 },
      { id: 'van', name: 'Van Executiva', basePrice: 200, pricePerKm: 3.5 }
    ];
  } catch (error) {
    console.error('Error in getVehicleRates:', error);
    return [
      { id: 'sedan', name: 'Sedan Executivo', basePrice: 100, pricePerKm: 2.5 },
      { id: 'suv', name: 'SUV Premium', basePrice: 150, pricePerKm: 3.0 },
      { id: 'van', name: 'Van Executiva', basePrice: 200, pricePerKm: 3.5 }
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
    const basePrice = 100;
    const pricePerKm = 2.5;
    
    const distancePrice = distance * pricePerKm;
    const totalPrice = basePrice + distancePrice;
    
    return isRoundTrip ? totalPrice * 2 : totalPrice;
  }
};

export const calculateTripPriceSync = (
  distance: number,
  basePrice: number,
  pricePerKm: number = 2.49,
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
