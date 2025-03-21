
import { loadGoogleMapsScript } from './loader';
import { isGoogleMapsLoaded } from './config';

// Improved geocode function with better fallback
export const geocodeAddress = async (address: string): Promise<google.maps.LatLng | null> => {
  if (!address) return null;
  
  try {
    await loadGoogleMapsScript();
    
    if (!isGoogleMapsLoaded()) {
      console.error('Google Maps Geocoder not loaded');
      return null;
    }
    
    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { address, region: 'br' },
        (results, status) => {
          if (status !== window.google.maps.GeocoderStatus.OK || !results || results.length === 0) {
            console.error('Geocoding failed:', status);
            resolve(null);
            return;
          }
          
          resolve(results[0].geometry.location);
        }
      );
    });
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

// Calculate estimated distance between two addresses using haversine formula when API fails
export const calculateHaversineDistance = async (origin: string, destination: string): Promise<number> => {
  try {
    const originCoords = await geocodeAddress(origin);
    const destinationCoords = await geocodeAddress(destination);
    
    if (!originCoords || !destinationCoords) return 0;
    
    const lat1 = originCoords.lat();
    const lon1 = originCoords.lng();
    const lat2 = destinationCoords.lat();
    const lon2 = destinationCoords.lng();
    
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    
    // Add 30% to account for roads vs straight line
    return distance * 1.3;
  } catch (error) {
    console.error('Error calculating Haversine distance:', error);
    // Return a reasonable default if calculation fails
    return 50;
  }
};
