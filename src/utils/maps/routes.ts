
import { loadGoogleMapsScript } from './loader';
import { isGoogleMapsLoaded } from './config';
import { calculateHaversineDistance, geocodeAddress } from './geocoding';

// Calculate route between two addresses (with improved fallback)
export const calculateRoute = async (
  origin: string,
  destination: string
): Promise<{
  distance: number; // in kilometers
  duration: number; // in minutes
  geometry?: any;
} | null> => {
  if (!origin || !destination) {
    console.error('Origin or destination is missing');
    return null;
  }
  
  console.log(`Calculating route from "${origin}" to "${destination}"`);
  
  try {
    // First try with Google Directions API
    if (isGoogleMapsLoaded()) {
      try {
        const originCoords = await geocodeAddress(origin);
        const destinationCoords = await geocodeAddress(destination);
        
        if (!originCoords || !destinationCoords) {
          throw new Error('Failed to geocode addresses');
        }
        
        return new Promise((resolve) => {
          const directionsService = new window.google.maps.DirectionsService();
          directionsService.route({
            origin: originCoords,
            destination: destinationCoords,
            travelMode: window.google.maps.TravelMode.DRIVING
          }, (result, status) => {
            if (status !== window.google.maps.DirectionsStatus.OK || !result) {
              console.error('Directions request failed:', status);
              // Fall back to haversine calculation
              calculateHaversineDistance(origin, destination).then(distance => {
                resolve({
                  distance: distance,
                  // Estimate duration based on average speed of 50 km/h
                  duration: Math.ceil(distance * 60 / 50)
                });
              });
              return;
            }
            
            const route = result.routes[0];
            const leg = route.legs[0];
            
            // Extract route data
            resolve({
              // Convert from meters to kilometers
              distance: leg.distance ? leg.distance.value / 1000 : 0,
              // Convert from seconds to minutes
              duration: leg.duration ? Math.ceil(leg.duration.value / 60) : 0,
              // For now, we'll use a simple array of coordinates
              geometry: {
                type: 'LineString',
                coordinates: route.overview_path.map(point => [point.lng(), point.lat()])
              }
            });
          });
        });
      } catch (error) {
        console.error('Error with Google Directions API:', error);
        // Fall back to haversine calculation
      }
    }
    
    // Fallback to haversine if Google API fails or isn't loaded
    const distance = await calculateHaversineDistance(origin, destination);
    return {
      distance,
      // Estimate duration based on average speed of 50 km/h
      duration: Math.ceil(distance * 60 / 50)
    };
  } catch (error) {
    console.error('Error calculating route:', error);
    // Last resort fallback
    return {
      distance: 50, // Default 50km
      duration: 60  // Default 60 minutes
    };
  }
};
