
import { toast } from 'sonner';
import { MAPBOX_TOKEN, isValidMapboxToken } from '@/utils/mapbox';
import mapboxgl from 'mapbox-gl';

// Get coordinates from an address using Mapbox Geocoding API
export const getCoordinatesFromAddress = async (address: string): Promise<[number, number] | null> => {
  const token = MAPBOX_TOKEN;
  if (!token) return null;
  
  try {
    console.log("Geocoding address:", address);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&country=br&limit=1`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Geocoding response for", address, ":", data);
    
    if (data.features && data.features.length > 0) {
      return data.features[0].center;
    }
    
    console.warn("No geocoding results for address:", address);
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
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
  const token = MAPBOX_TOKEN;
  if (!token) return null;
  
  try {
    console.log("Getting route from", start, "to", end);
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&steps=true&overview=full&access_token=${token}`
    );
    
    if (!response.ok) {
      throw new Error(`Directions API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Route API response:", data);
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      let distance = 0;
      let duration = 0;
      
      if (route.legs && route.legs.length > 0) {
        const leg = route.legs[0];
        distance = leg.distance;
        duration = leg.duration;
      }
      
      return {
        geometry: route.geometry,
        distance,
        duration
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting route:', error);
    return null;
  }
};

// Create a static map URL for fallback
export const createStaticMapUrl = (
  start: [number, number], 
  end: [number, number], 
  style: string = 'streets-v12'
): string | null => {
  const token = MAPBOX_TOKEN;
  if (!token) return null;
  
  try {
    const url = new URL('https://api.mapbox.com/styles/v1/mapbox/' + style + '/static/');
    
    // Add a line between start and end points
    url.pathname += `path-5+3887be(${start[0]},${start[1]};${end[0]},${end[1]})/`;
    
    // Add markers
    const originMarker = `pin-s-a+00FF00(${start[0]},${start[1]})`;
    const destMarker = `pin-s-b+FF0000(${end[0]},${end[1]})`;
    url.pathname += `${originMarker},${destMarker}/`;
    
    // Create a bounding box that includes both points with some padding
    const lngMin = Math.min(start[0], end[0]);
    const lngMax = Math.max(start[0], end[0]);
    const latMin = Math.min(start[1], end[1]);
    const latMax = Math.max(start[1], end[1]);
    
    // Add padding to the bounding box
    const padding = 0.1;
    const bounds = [
      lngMin - padding,
      latMin - padding,
      lngMax + padding,
      latMax + padding
    ].join(',');
    
    // Add bounds and other parameters
    url.pathname += `${bounds}/`;
    url.pathname += '800x500@2x';  // width x height @retina
    
    // Add access token
    url.search = `access_token=${token}`;
    
    return url.toString();
  } catch (error) {
    console.error('Error creating static map URL:', error);
    return null;
  }
};

// Check if map can be initialized or if we need fallback
export const validateMapboxToken = (): boolean => {
  if (!isValidMapboxToken(MAPBOX_TOKEN)) {
    console.error("Invalid Mapbox token", MAPBOX_TOKEN);
    toast.error('Token do Mapbox inválido. Verifique a configuração.');
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
  // Note: hardwareConcurrency is already part of Navigator interface
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
  if (!isValidMapboxToken(MAPBOX_TOKEN)) {
    console.error('Invalid Mapbox token');
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
