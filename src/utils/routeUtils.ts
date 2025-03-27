
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
    if (!origin || !destination) {
      console.log("Missing origin or destination");
      return null;
    }

    // Geocode the addresses to get coordinates
    const originCoords = await geocodeAddress(origin);
    const destinationCoords = await geocodeAddress(destination);

    if (!originCoords || !destinationCoords) {
      console.error('Failed to geocode one of the addresses:', { origin, destination });
      return null;
    }

    console.log("Got coordinates", { originCoords, destinationCoords });

    // Calculate the route between the coordinates
    const route = await getRouteInfo(originCoords, destinationCoords);
    
    if (!route) {
      console.error('Failed to get route info');
      return null;
    }
    
    // Transform to match expected format
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
  } catch (error) {
    console.error('Error calculating route:', error);
    return null;
  }
};

// Function to geocode an address to coordinates
export const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  try {
    console.log("Geocoding address:", address);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&country=br&limit=1`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const coordinates = data.features[0].center;
      return [coordinates[0], coordinates[1]]; // [longitude, latitude]
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

// Function to get route information between two coordinates
export const getRouteInfo = async (
  origin: [number, number],
  destination: [number, number]
): Promise<{ distance: number; duration: number; geometry: string } | null> => {
  try {
    console.log("Getting route between:", origin, destination);
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?access_token=${MAPBOX_TOKEN}&overview=full&geometries=polyline`
    );

    if (!response.ok) {
      throw new Error(`Directions API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      return {
        // Convert distance from meters to kilometers
        distance: Math.round((route.distance / 1000) * 10) / 10,
        // Convert duration from seconds to minutes
        duration: Math.round(route.duration / 60),
        geometry: route.geometry
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting route info:', error);
    return null;
  }
};

// Function to create a static map URL with the route
export const createStaticMapUrl = (
  origin: [number, number],
  destination: [number, number],
  width = 500,
  height = 300
): string => {
  const markers = `pin-s-a+4A89F3(${origin[0]},${origin[1]}),pin-s-b+EB4C36(${destination[0]},${destination[1]})`;
  
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${markers}/auto/${width}x${height}@2x?access_token=${MAPBOX_TOKEN}`;
};
