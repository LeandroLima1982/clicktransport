
import { MAPBOX_TOKEN } from './mapbox';

export interface RouteInfo {
  distance: number; // in kilometers
  duration: number; // in minutes
  geometry?: any;
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

// Calculate price based on real distance with the new rate
export const calculateTripPrice = (
  distance: number,
  basePrice: number,
  pricePerKm: number = 2.49,
  isRoundTrip: boolean = false
): number => {
  const distancePrice = distance * pricePerKm;
  const totalPrice = basePrice + distancePrice;
  
  return isRoundTrip ? totalPrice * 2 : totalPrice;
};

// Format time duration in hours and minutes
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
