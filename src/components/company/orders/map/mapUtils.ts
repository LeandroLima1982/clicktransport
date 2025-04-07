
import { toast } from 'sonner';
import { GOOGLE_MAPS_API_KEY } from '@/utils/googlemaps';
import mapboxgl from 'mapbox-gl';

// Get coordinates from an address using Google Maps Geocoding API
export const getCoordinatesFromAddress = async (address: string): Promise<[number, number] | null> => {
  if (!GOOGLE_MAPS_API_KEY) return null;
  
  try {
    console.log("Geocoding address:", address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}&region=br`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return [location.lng, location.lat];
    }
    
    console.warn("No geocoding results for address:", address);
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

// Fetch route data between two points using Google Maps Directions API
export const fetchRouteData = async (
  start: [number, number], 
  end: [number, number]
): Promise<{
  geometry: any;
  distance: number;
  duration: number;
} | null> => {
  if (!GOOGLE_MAPS_API_KEY) return null;
  
  try {
    console.log("Getting route from", start, "to", end);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${start[1]},${start[0]}&destination=${end[1]},${end[0]}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Directions API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const leg = route.legs[0];
      
      return {
        // Decodificar a geometry da rota
        geometry: {
          coordinates: decodePolyline(route.overview_polyline.points),
          type: "LineString"
        },
        // Converter metros para quilômetros
        distance: leg.distance.value / 1000,
        // Converter segundos para minutos
        duration: Math.ceil(leg.duration.value / 60)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting route:', error);
    return null;
  }
};

// Função auxiliar para decodificar polylines do Google
function decodePolyline(encoded: string): [number, number][] {
  const points = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push([lng * 1e-5, lat * 1e-5]);
  }
  return points;
}

// Explicitly export getMapboxDirections as an alias for fetchRouteData but with address inputs
export const getMapboxDirections = async (
  originAddress: string,
  destinationAddress: string
): Promise<{
  geometry: any;
  distance: number;
  duration: number;
} | null> => {
  try {
    // First get coordinates from addresses
    const originCoords = await getCoordinatesFromAddress(originAddress);
    const destCoords = await getCoordinatesFromAddress(destinationAddress);
    
    if (!originCoords || !destCoords) {
      console.error('Could not get coordinates for addresses');
      return null;
    }
    
    // Then fetch route data
    return await fetchRouteData(originCoords, destCoords);
  } catch (error) {
    console.error('Error in getMapboxDirections:', error);
    return null;
  }
};

// Create a static map URL using Google Maps Static Maps API
export const createStaticMapUrl = (
  start: [number, number], 
  end: [number, number]
): string | null => {
  if (!GOOGLE_MAPS_API_KEY) return null;
  
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/staticmap');
    
    // Set map size and type
    url.searchParams.append('size', '800x500');
    url.searchParams.append('maptype', 'roadmap');
    
    // Add markers for origin and destination
    url.searchParams.append('markers', `color:green|label:A|${start[1]},${start[0]}`);
    url.searchParams.append('markers', `color:red|label:B|${end[1]},${end[0]}`);
    
    // Add path between points
    url.searchParams.append('path', `color:0x3887BE|weight:5|${start[1]},${start[0]}|${end[1]},${end[0]}`);
    
    // Create a bounding box that includes both points with some padding
    const lngMin = Math.min(start[0], end[0]);
    const lngMax = Math.max(start[0], end[0]);
    const latMin = Math.min(start[1], end[1]);
    const latMax = Math.max(start[1], end[1]);
    
    // Add padding to the bounding box
    const padding = 0.05;
    const bounds = `${latMin - padding},${lngMin - padding}|${latMax + padding},${lngMax + padding}`;
    
    // Add bounds parameter
    url.searchParams.append('center', `${(latMin + latMax) / 2},${(lngMin + lngMax) / 2}`);
    url.searchParams.append('zoom', '12');
    
    // Add API key
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY);
    
    return url.toString();
  } catch (error) {
    console.error('Error creating static map URL:', error);
    return null;
  }
};

// Export getStaticMapUrl as an alias and add implementation for string addresses
export const getStaticMapUrl = async (
  originAddress: string,
  destinationAddress: string
): Promise<string | null> => {
  try {
    // First get coordinates from addresses
    const originCoords = await getCoordinatesFromAddress(originAddress);
    const destCoords = await getCoordinatesFromAddress(destinationAddress);
    
    if (!originCoords || !destCoords) {
      console.error('Could not get coordinates for addresses');
      return null;
    }
    
    // Then create static map URL
    return createStaticMapUrl(originCoords, destCoords);
  } catch (error) {
    console.error('Error in getStaticMapUrl:', error);
    return null;
  }
};

// Check if API key is valid
export const validateMapboxToken = (): boolean => {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.trim() === '') {
    console.error("Invalid Google Maps API key");
    toast.error('Chave da API do Google Maps inválida. Verifique a configuração.');
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
    
    // Additional check for WebGL capabilities
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      console.log('WebGL renderer:', renderer);
      
      // Check for software renderers which might indicate poor performance
      const isSoftwareRenderer = renderer.includes('SwiftShader') || 
                               renderer.includes('ANGLE') ||
                               renderer.includes('llvmpipe');
      
      if (isSoftwareRenderer) {
        console.warn('Software WebGL renderer detected, performance may be limited');
        return false;
      }
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
    console.error('Invalid Google Maps API key');
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
