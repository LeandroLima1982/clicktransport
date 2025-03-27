
import { MAPBOX_TOKEN } from '@/utils/mapbox';

interface MapCoordinates {
  longitude: number;
  latitude: number;
}

// Function to check if WebGL is supported and device has enough performance for interactive maps
export function canUseInteractiveMaps(): boolean {
  // Check if window is defined (for SSR compatibility)
  if (typeof window === 'undefined' || !window.WebGLRenderingContext) {
    return false;
  }
  
  // Try to get a WebGL context
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    // If WebGL is not supported, return false
    if (!gl) {
      return false;
    }
    
    // Check if device has enough performance
    // Use safer browser feature detection for deviceMemory
    if (
      'deviceMemory' in navigator && 
      // @ts-ignore - TypeScript doesn't know about this newer API
      navigator.deviceMemory < 4
    ) {
      return false;
    }
    
    // Check if device is in a battery saving mode (if available)
    // Use safe browser feature detection
    if (
      'connection' in navigator && 
      // @ts-ignore - TypeScript doesn't know about this newer API
      navigator.connection?.saveData === true || 
      // Check connection type if available
      ('connection' in navigator && 
       // @ts-ignore - TypeScript doesn't know about this newer API
       navigator.connection?.effectiveType && 
       // @ts-ignore - TypeScript doesn't know about this newer API
       ['slow-2g', '2g', '3g'].includes(navigator.connection.effectiveType))
    ) {
      return false;
    }
    
    // Device should be capable of running interactive maps
    return true;
  } catch (e) {
    console.error('Error checking WebGL support:', e);
    return false;
  }
}

// Create static map image URL from Mapbox
export function createStaticMapUrl(
  origin: [number, number],
  destination: [number, number],
  width: number = 600,
  height: number = 400,
  zoom: number = 12
): string {
  if (!MAPBOX_TOKEN) {
    console.error('Mapbox token is missing');
    return '';
  }
  
  // Create a more visually appealing map with a line between points and Uber-like styling
  const originStr = `${origin[0]},${origin[1]}`;
  const destinationStr = `${destination[0]},${destination[1]}`;
  
  // Define markers for origin (blue) and destination (red) in Uber style
  const originMarker = `pin-s-a+0073FF(${originStr})`;
  const destinationMarker = `pin-s-b+000000(${destinationStr})`;
  
  // Create a GeoJSON path between the two points with Uber-like styling
  const path = {
    type: 'Feature',
    properties: {
      stroke: '#0073FF',
      'stroke-width': 5,
      'stroke-opacity': 0.8
    },
    geometry: {
      type: 'LineString',
      coordinates: [origin, destination]
    }
  };
  
  // Encode the path to add it to the URL
  const encodedPath = encodeURIComponent(JSON.stringify(path));
  
  // Calculate auto zoom level and center to fit both points
  const bounds = getBoundsForCoordinates([origin, destination]);
  const center = getCenterOfBounds(bounds);
  
  // Add a small padding to ensure both markers are visible
  const padding = 0.1;
  const adjustedBounds = [
    [bounds[0][0] - padding, bounds[0][1] - padding],
    [bounds[1][0] + padding, bounds[1][1] + padding]
  ];
  
  // Convert bounds to string format "lon1,lat1,lon2,lat2"
  const boundsStr = `${adjustedBounds[0][0]},${adjustedBounds[0][1]},${adjustedBounds[1][0]},${adjustedBounds[1][1]}`;
  
  // Create the URL with auto-fit for better visualization - Uber-like styling
  const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/` +
    `geojson(${encodedPath}),` +
    `${originMarker},` +
    `${destinationMarker}/` +
    `auto/${width}x${height}?` +
    `padding=50&` +
    `access_token=${MAPBOX_TOKEN}`;
  
  return mapboxUrl;
}

// Calculate bounds that contain all coordinates
function getBoundsForCoordinates(coords: [number, number][]): [[number, number], [number, number]] {
  let minLng = coords[0][0];
  let maxLng = coords[0][0];
  let minLat = coords[0][1];
  let maxLat = coords[0][1];
  
  for (const coord of coords) {
    minLng = Math.min(minLng, coord[0]);
    maxLng = Math.max(maxLng, coord[0]);
    minLat = Math.min(minLat, coord[1]);
    maxLat = Math.max(maxLat, coord[1]);
  }
  
  return [[minLng, minLat], [maxLng, maxLat]];
}

// Calculate center point of bounds
function getCenterOfBounds(bounds: [[number, number], [number, number]]): [number, number] {
  const centerLng = (bounds[0][0] + bounds[1][0]) / 2;
  const centerLat = (bounds[0][1] + bounds[1][1]) / 2;
  return [centerLng, centerLat];
}

// Calculate distance between two points (in km)
export function calculateDistanceBetween(
  point1: [number, number],
  point2: [number, number]
): number {
  // Haversine formula to calculate distance between two coordinates
  const R = 6371; // Earth's radius in km
  const dLat = (point2[1] - point1[1]) * Math.PI / 180;
  const dLon = (point2[0] - point1[0]) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1[1] * Math.PI / 180) * Math.cos(point2[1] * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  
  return distance;
}

// Validate Mapbox token
export function validateMapboxToken(): boolean {
  return !!MAPBOX_TOKEN && MAPBOX_TOKEN.length > 20 && !MAPBOX_TOKEN.includes('YOUR_MAPBOX_TOKEN');
}

// Get coordinates from address with improved error handling (Uber-like)
export async function getCoordinatesFromAddress(address: string): Promise<[number, number] | null> {
  if (!address || !MAPBOX_TOKEN) return null;

  try {
    // First try with more specific parameters for better results (like Uber)
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?` +
      `access_token=${MAPBOX_TOKEN}&country=br&limit=1&types=address,poi,place` +
      `&language=pt-BR&proximity=ip&autocomplete=true`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.features && data.features.length > 0) {
      console.log('Address geocoded successfully:', data.features[0].place_name);
      return data.features[0].center as [number, number];
    }

    console.warn('No geocoding results found for:', address);
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    
    // Fallback to simpler query if specific query fails
    try {
      const fallbackResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?` +
        `access_token=${MAPBOX_TOKEN}&country=br&limit=1`
      );
      
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback geocoding API error: ${fallbackResponse.status}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      if (fallbackData.features && fallbackData.features.length > 0) {
        console.log('Address geocoded with fallback:', fallbackData.features[0].place_name);
        return fallbackData.features[0].center as [number, number];
      }
    } catch (fallbackError) {
      console.error('Fallback geocoding also failed:', fallbackError);
    }
    
    return null;
  }
}

// Fetch route data with improved parameters and error handling (Uber-like)
export async function fetchRouteData(
  origin: [number, number],
  destination: [number, number]
): Promise<{ distance: number; duration: number; geometry: any } | null> {
  if (!MAPBOX_TOKEN) return null;

  try {
    // Use the directions API with better parameters for Uber-like experience
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?` +
      `geometries=geojson&overview=full&steps=true&annotations=distance,duration,speed&voice_instructions=true&` +
      `banner_instructions=true&voice_units=metric&access_token=${MAPBOX_TOKEN}`
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
      
      // Detailed logging for diagnostic purposes
      console.log(`Route calculated: ${distanceKm.toFixed(2)}km, ${durationMin}min`);
      
      return {
        distance: parseFloat(distanceKm.toFixed(2)),
        duration: durationMin,
        geometry: route.geometry,
      };
    }

    console.warn('No routes found between the specified points');
    return null;
  } catch (error) {
    console.error('Error getting route:', error);
    return null;
  }
}

// Function to get current user location with high accuracy (Uber-like)
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      position => {
        console.log('Got user position:', position.coords);
        resolve(position);
      },
      error => {
        console.error('Error getting position:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

// Watch user position changes with high accuracy (Uber-like live tracking)
export function watchPosition(callback: (position: GeolocationPosition) => void): number {
  if (!navigator.geolocation) {
    console.error('Geolocation not supported by your browser');
    return 0;
  }
  
  return navigator.geolocation.watchPosition(
    callback,
    error => {
      console.error('Error watching position:', error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
}

// Stop watching position
export function clearPositionWatch(watchId: number): void {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}

// NEW: Reverse geocode coordinates to address (Uber-like)
export async function reverseGeocode(coords: [number, number]): Promise<string | null> {
  if (!MAPBOX_TOKEN) return null;
  
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?` +
      `access_token=${MAPBOX_TOKEN}&language=pt-BR&types=address,place,neighborhood,locality`
    );
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }
    
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}

// Format address for display in a more user-friendly way (Uber-like)
export function formatAddress(address: string): string {
  if (!address) return '';
  
  // Remove country info from the end (usually not needed in UI)
  return address.replace(/, Brasil$/, '');
}

// Get ETA with traffic considerations (Uber-like)
export function getEstimatedArrival(durationMinutes: number): string {
  const now = new Date();
  const arrivalTime = new Date(now.getTime() + durationMinutes * 60000);
  
  return arrivalTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Calculate fare estimate based on distance and duration (Uber-like)
export function calculateFareEstimate(
  distanceKm: number, 
  durationMinutes: number,
  serviceType: 'standard' | 'premium' | 'luxury' = 'standard'
): number {
  // Base rates depend on service type
  let baseFare = 7;
  let pricePerKm = 2.5;
  let pricePerMinute = 0.26;
  
  if (serviceType === 'premium') {
    baseFare = 10;
    pricePerKm = 3.2;
    pricePerMinute = 0.35;
  } else if (serviceType === 'luxury') {
    baseFare = 15;
    pricePerKm = 4.5;
    pricePerMinute = 0.45;
  }
  
  // Calculate total fare
  const distanceCharge = distanceKm * pricePerKm;
  const timeCharge = durationMinutes * pricePerMinute;
  
  return parseFloat((baseFare + distanceCharge + timeCharge).toFixed(2));
}

// Detect address format from input (CEP, street, etc.) like Uber does
export function detectAddressFormat(input: string): 'cep' | 'street' | 'poi' | 'unknown' {
  // Check for Brazilian CEP format
  const cepRegex = /^(\d{5})-?(\d{3})$/;
  if (cepRegex.test(input.replace(/\D/g, ''))) {
    return 'cep';
  }
  
  // Check if input is likely a street address (contains street indicators)
  const streetIndicators = ['rua', 'r.', 'avenida', 'av.', 'av', 'alameda', 'al.', 'travessa', 'rodovia', 'estrada'];
  if (streetIndicators.some(indicator => input.toLowerCase().includes(indicator))) {
    return 'street';
  }
  
  // Check if input might be a point of interest
  const poiIndicators = ['shopping', 'restaurante', 'hotel', 'aeroporto', 'terminal', 'praça', 'parque', 'supermercado'];
  if (poiIndicators.some(indicator => input.toLowerCase().includes(indicator))) {
    return 'poi';
  }
  
  return 'unknown';
}

// Generate autofill suggestions based on partial input (Uber-like)
export async function getAddressAutofill(
  partialInput: string,
  proximity?: [number, number]
): Promise<Array<{ description: string; placeId: string; }>> {
  if (!MAPBOX_TOKEN || partialInput.length < 3) return [];
  
  try {
    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(partialInput)}.json?` +
      `access_token=${MAPBOX_TOKEN}&country=br&language=pt-BR&` + 
      `autocomplete=true&types=address,poi,place,neighborhood&limit=5`;
    
    // Add proximity if available to prioritize nearby results (like Uber)
    if (proximity) {
      url += `&proximity=${proximity[0]},${proximity[1]}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Autofill API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return [];
    }
    
    // Format suggestions in a clean, Uber-like way
    return data.features.map((feature: any) => ({
      description: feature.place_name,
      placeId: feature.id,
      // Add more properties from the feature if needed
    }));
  } catch (error) {
    console.error('Error getting address autofill:', error);
    return [];
  }
}

