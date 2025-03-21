
// This file is kept for backwards compatibility
// It re-exports the Google Maps API key for components that still reference it
import { GOOGLE_MAPS_API_KEY, isValidApiKey } from './googlemaps';

// Re-export Google Maps key for backward compatibility
export const MAPBOX_TOKEN = GOOGLE_MAPS_API_KEY;
export const validateMapboxToken = isValidApiKey;
