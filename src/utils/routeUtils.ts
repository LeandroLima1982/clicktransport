import { GOOGLE_MAPS_API_KEY } from './googlemaps';
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

// Helper function to extract city name from address
const extractCityFromAddress = (address: string): string | null => {
  try {
    // Try to extract city from address format like "Street, City, State"
    const parts = address.split(',');
    if (parts.length >= 2) {
      // City is usually the second-to-last part before the state
      return parts[parts.length - 2].trim();
    }
    return null;
  } catch (error) {
    console.error("Error extracting city from address:", error);
    return null;
  }
};

// Geocode an address to coordinates
const googleGeocodeAddress = async (address: string): Promise<[number, number] | null> => {
  if (!address || !GOOGLE_MAPS_API_KEY) return null;

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return [location.lng, location.lat];
    }

    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

// Calculate route between two coordinates
const googleCalculateRoute = async (
  origin: [number, number],
  destination: [number, number]
): Promise<RouteInfo | null> => {
  if (!GOOGLE_MAPS_API_KEY) return null;

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin[1]},${origin[0]}&destination=${destination[1]},${destination[0]}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Directions API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const leg = route.legs[0];
      
      // Convert distance from meters to kilometers
      const distanceKm = leg.distance.value / 1000;
      
      // Convert duration from seconds to minutes
      const durationMin = Math.ceil(leg.duration.value / 60);
      
      return {
        distance: parseFloat(distanceKm.toFixed(2)),
        duration: durationMin,
        geometry: route.overview_polyline
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting route:', error);
    return null;
  }
};

// Function to check if we have a saved distance between city names
const getCityDistanceFromDb = async (origin: string, destination: string): Promise<RouteInfo | null> => {
  try {
    // Extract city names from addresses (assuming they're in the format "Street, City, State")
    const originCity = extractCityFromAddress(origin);
    const destinationCity = extractCityFromAddress(destination);
    
    if (!originCity || !destinationCity) {
      return null;
    }
    
    console.log("Checking distance between cities:", originCity, destinationCity);
    
    // Find city IDs from names
    const { data: citiesData, error: citiesError } = await supabase
      .from('cities')
      .select('id, name, state')
      .or(`name.ilike.${originCity}%,name.ilike.${destinationCity}%`);
    
    if (citiesError || !citiesData || citiesData.length < 2) {
      console.log("Could not find both cities in database:", citiesError);
      return null;
    }
    
    const originCityData = citiesData.find(c => c.name.toLowerCase().includes(originCity.toLowerCase()));
    const destinationCityData = citiesData.find(c => c.name.toLowerCase().includes(destinationCity.toLowerCase()));
    
    if (!originCityData || !destinationCityData) {
      console.log("Could not match cities from address to database");
      return null;
    }
    
    // Look up distance between these cities
    const { data: distanceData, error: distanceError } = await supabase
      .from('city_distances')
      .select('*')
      .or(`and(origin_id.eq.${originCityData.id},destination_id.eq.${destinationCityData.id}),and(origin_id.eq.${destinationCityData.id},destination_id.eq.${originCityData.id})`)
      .limit(1);
    
    if (distanceError || !distanceData || distanceData.length === 0) {
      console.log("No stored distance found between cities");
      return null;
    }
    
    // Return the stored distance data
    return {
      distance: distanceData[0].distance,
      duration: distanceData[0].duration
    };
  } catch (error) {
    console.error("Error checking city distance:", error);
    return null;
  }
};

export const calculateRoute = async (
  origin: string,
  destination: string
): Promise<RouteInfo | null> => {
  try {
    // First check if this is a city pair with stored distance
    const cityDistance = await getCityDistanceFromDb(origin, destination);
    if (cityDistance) {
      console.log("Using stored city distance:", cityDistance);
      return {
        distance: cityDistance.distance,
        duration: cityDistance.duration
      };
    }
    
    // If no stored distance, geocode the addresses and calculate route
    const originCoords = await googleGeocodeAddress(origin);
    const destinationCoords = await googleGeocodeAddress(destination);

    if (!originCoords || !destinationCoords) {
      console.error('Failed to geocode one of the addresses');
      return null;
    }

    // Calculate the route between the coordinates
    const route = await googleCalculateRoute(originCoords, destinationCoords);
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
