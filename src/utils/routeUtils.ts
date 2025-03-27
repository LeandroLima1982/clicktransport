
import { MAPBOX_TOKEN } from './mapbox';
import { supabase } from '@/integrations/supabase/client';

export interface RouteInfo {
  distance: number; // in kilometers
  duration: number; // in minutes
  geometry?: any;
  start_location?: { lat: number; lng: number };
  end_location?: { lat: number; lng: number };
  success?: boolean;
  route?: any;
}

export interface VehicleRate {
  id: string;
  name: string;
  basePrice: number;
  pricePerKm: number;
  capacity: number;
}

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
        success: true,
        distance: cityDistance.distance,
        duration: cityDistance.duration,
        // Add placeholder locations
        start_location: { lat: 0, lng: 0 },
        end_location: { lat: 0, lng: 0 },
        geometry: ''
      };
    }
    
    // If no stored distance, geocode the addresses and calculate route
    const originCoords = await geocodeAddress(origin);
    const destinationCoords = await geocodeAddress(destination);

    if (!originCoords || !destinationCoords) {
      console.error('Failed to geocode one of the addresses');
      return null;
    }

    // Calculate the route between the coordinates
    const route = await getRouteInfo(originCoords, destinationCoords);
    
    // Transform to match expected format
    if (route) {
      return {
        success: true,
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry,
        start_location: { 
          lat: originCoords[1], 
          lng: originCoords[0] 
        },
        end_location: { 
          lat: destinationCoords[1], 
          lng: destinationCoords[0] 
        },
        route: {
          distance: route.distance,
          duration: route.duration,
          geometry: route.geometry,
          start_location: { 
            lat: originCoords[1], 
            lng: originCoords[0] 
          },
          end_location: { 
            lat: destinationCoords[1], 
            lng: destinationCoords[0] 
          }
        }
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error calculating route:', error);
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
      return data.features[0].center;
    }
    return null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
};

const getRouteInfo = async (
  origin: [number, number],
  destination: [number, number]
): Promise<RouteInfo | null> => {
  if (!origin || !destination || !MAPBOX_TOKEN) return null;

  try {
    const originStr = `${origin[0]},${origin[1]}`;
    const destinationStr = `${destination[0]},${destination[1]}`;
    
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${originStr};${destinationStr}?geometries=polyline&overview=full&steps=false&access_token=${MAPBOX_TOKEN}`
    );

    if (!response.ok) {
      throw new Error(`Directions API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      return {
        distance: route.distance / 1000, // Convert meters to kilometers
        duration: Math.round(route.duration / 60), // Convert seconds to minutes
        geometry: route.geometry
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error getting route info:", error);
    return null;
  }
};

export const getVehicleRates = async (): Promise<VehicleRate[]> => {
  try {
    // In a real app, fetch from database
    // Simulating API call for now
    return [
      {
        id: 'sedan',
        name: 'Sedan Executivo',
        basePrice: 79.90,
        pricePerKm: 2.10,
        capacity: 4
      },
      {
        id: 'suv',
        name: 'SUV Premium',
        basePrice: 119.90,
        pricePerKm: 2.49,
        capacity: 6
      },
      {
        id: 'van',
        name: 'Van Executiva',
        basePrice: 199.90,
        pricePerKm: 3.39,
        capacity: 15
      }
    ];
  } catch (error) {
    console.error('Error loading vehicle rates:', error);
    return [];
  }
};
