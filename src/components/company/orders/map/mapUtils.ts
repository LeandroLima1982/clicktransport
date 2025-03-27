
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
    // (simple heuristic: device memory > 4GB if available)
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
      return false;
    }
    
    // Check if device is in a battery saving mode (if available)
    if (navigator.connection && 
        (navigator.connection.saveData || 
         (navigator.connection.effectiveType && ['slow-2g', '2g', '3g'].includes(navigator.connection.effectiveType)))) {
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
  
  // Create a more visually appealing map with a line between points
  const originStr = `${origin[0]},${origin[1]}`;
  const destinationStr = `${destination[0]},${destination[1]}`;
  
  // Define markers for origin (green) and destination (red)
  const originMarker = `pin-s-a+00FF00(${originStr})`;
  const destinationMarker = `pin-s-b+FF0000(${destinationStr})`;
  
  // Create a GeoJSON path between the two points
  const path = {
    type: 'Feature',
    properties: {
      stroke: '#3887be',
      'stroke-width': 4,
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
  
  // Create the URL with auto-fit for better visualization
  const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/` +
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
