
import { toast } from 'sonner';
import { GOOGLE_MAPS_API_KEY, loadGoogleMapsScript } from '@/utils/googlemaps';

// Get coordinates from an address using Google Geocoding API
export const getCoordinatesFromAddress = async (address: string): Promise<[number, number] | null> => {
  if (!GOOGLE_MAPS_API_KEY) return null;
  
  return new Promise((resolve) => {
    loadGoogleMapsScript(() => {
      try {
        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode(
          { address: address, region: 'br' },
          (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
              const location = results[0].geometry.location;
              resolve([location.lng(), location.lat()]);
            } else {
              console.error('Geocoding error:', status);
              resolve(null);
            }
          }
        );
      } catch (error) {
        console.error('Error geocoding address:', error);
        resolve(null);
      }
    });
  });
};

// Fetch route data between two points
export const fetchRouteData = async (
  start: [number, number], 
  end: [number, number]
): Promise<{
  geometry: any;
  distance: number;
  duration: number;
} | null> => {
  if (!GOOGLE_MAPS_API_KEY) return null;
  
  return new Promise((resolve) => {
    loadGoogleMapsScript(() => {
      try {
        const directionsService = new google.maps.DirectionsService();
        
        directionsService.route(
          {
            origin: { lat: start[1], lng: start[0] },
            destination: { lat: end[1], lng: end[0] },
            travelMode: google.maps.TravelMode.DRIVING
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
              const route = result.routes[0].legs[0];
              
              // Convert distance from meters to kilometers
              const distanceKm = (route.distance?.value || 0) / 1000;
              
              // Convert duration from seconds to minutes
              const durationMin = Math.ceil((route.duration?.value || 0) / 60);
              
              const path = result.routes[0].overview_path;
              const coordinates = path.map(point => [point.lng(), point.lat()]);
              
              resolve({
                geometry: {
                  type: 'LineString',
                  coordinates
                },
                distance: distanceKm,
                duration: durationMin
              });
            } else {
              console.error('Directions API error:', status);
              resolve(null);
            }
          }
        );
      } catch (error) {
        console.error('Error calculating route:', error);
        resolve(null);
      }
    });
  });
};

// Create a static map URL for fallback
export const createStaticMapUrl = (
  start: [number, number], 
  end: [number, number]
): string | null => {
  if (!GOOGLE_MAPS_API_KEY) return null;
  
  try {
    // Center point between start and end
    const centerLng = (start[0] + end[0]) / 2;
    const centerLat = (start[1] + end[1]) / 2;
    
    // Calculate appropriate zoom level based on distance
    const latDiff = Math.abs(start[1] - end[1]);
    const lngDiff = Math.abs(start[0] - end[0]);
    const maxDiff = Math.max(latDiff, lngDiff);
    let zoom = 12;
    
    if (maxDiff > 0.5) zoom = 9;
    else if (maxDiff > 0.2) zoom = 10;
    else if (maxDiff > 0.1) zoom = 11;
    else if (maxDiff > 0.05) zoom = 12;
    else if (maxDiff > 0.01) zoom = 13;
    else zoom = 14;
    
    // Create markers for start and end points
    const originMarker = `markers=color:green|label:A|${start[1]},${start[0]}`;
    const destMarker = `markers=color:red|label:B|${end[1]},${end[0]}`;
    
    // Create the static map URL
    return `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=${zoom}&size=800x500&maptype=roadmap&${originMarker}&${destMarker}&key=${GOOGLE_MAPS_API_KEY}`;
  } catch (error) {
    console.error('Error creating static map URL:', error);
    return null;
  }
};

// Check if Google Maps API key is valid
export const validateMapboxToken = (): boolean => {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.includes('YOUR_')) {
    console.error("Invalid Google Maps API key");
    toast.error('Token do Google Maps inválido. Verifique a configuração.');
    return false;
  }
  return true;
};

// Check if WebGL is supported by the browser
export const isWebGLSupported = (): boolean => {
  try {
    // Try to create a WebGL context
    const canvas = document.createElement('canvas');
    // Explicitly type the WebGL context
    const gl = (canvas.getContext('webgl') || 
                canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    
    if (!gl) {
      console.warn('WebGL not supported by browser');
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('WebGL detection error:', e);
    return false;
  }
};

// Type declaration for Navigator with deviceMemory
interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

// Check if the device has enough performance for interactive maps
export const hasAdequatePerformance = (): boolean => {
  // Check for mobile devices which might struggle with complex maps
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // Cast navigator to our extended interface
  const nav = navigator as NavigatorWithMemory;
  
  // Check for memory constraints (only if the property exists)
  const lowMemory = typeof nav.deviceMemory !== 'undefined' && nav.deviceMemory < 4;
  
  // Check processor cores
  const lowCPU = navigator.hardwareConcurrency < 4;
  
  // For low-end devices, use static maps
  if (isMobile && (lowMemory || lowCPU)) {
    console.log('Device has limited resources, using static map');
    toast.info('Dispositivo com recursos limitados, usando mapa estático para melhor experiência');
    return false;
  }
  
  return true;
};

// Determine if interactive maps can be used
export const canUseInteractiveMaps = (): boolean => {
  if (!validateMapboxToken()) {
    console.error('Invalid Google Maps token');
    return false;
  }
  
  if (!isWebGLSupported()) {
    console.warn('WebGL not supported, falling back to static maps');
    toast.info('Seu navegador não suporta mapas interativos, usando mapa estático');
    return false;
  }
  
  if (!hasAdequatePerformance()) {
    console.warn('Device performance may be limited, using static maps for better experience');
    return false;
  }
  
  return true;
};
