import React from 'react';
import { Building, Landmark, Home, Navigation, MapPin, ShoppingBag, School, Hospital, Hotel, Coffee, Utensils, Bus, Plane, Music as MusicIcon, Dumbbell, Church, Library as LibraryBig, Trees } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Export the Mapbox token - this should be the token you have added in Supabase secrets
export const MAPBOX_TOKEN = 'pk.eyJ1IjoibGVhbmRyb2xpbWExOTgyIiwiYSI6ImNtODA3MGxmaTB0dDAyanFia244dnl1bmcifQ.6iV8YcZ-x_gdi8uJWg5aCw';

// POI types to include in the geocoding request
export const POI_TYPES = 'poi,address,place,neighborhood,locality,district';

// Function type for getPlaceIcon
type IconComponent = React.ReactElement;

// Improved function for getting the appropriate icon based on place category
export const getPlaceIcon = (place: any): IconComponent => {
  const category = place.properties?.category;
  const placeType = place.place_type?.[0];
  
  // Check for specific categories
  if (category === 'airport' || category?.includes('airport')) return React.createElement(Plane, { className: "h-4 w-4" });
  if (category === 'hotel' || category?.includes('hotel') || category?.includes('lodging')) return React.createElement(Hotel, { className: "h-4 w-4" });
  if (category?.includes('restaurant') || category?.includes('food')) return React.createElement(Utensils, { className: "h-4 w-4" });
  if (category?.includes('coffee') || category?.includes('cafe')) return React.createElement(Coffee, { className: "h-4 w-4" });
  if (category?.includes('shopping') || category?.includes('store') || category?.includes('mall')) return React.createElement(ShoppingBag, { className: "h-4 w-4" });
  if (category?.includes('school') || category?.includes('education') || category?.includes('university')) return React.createElement(School, { className: "h-4 w-4" });
  if (category?.includes('hospital') || category?.includes('medical') || category?.includes('health')) return React.createElement(Hospital, { className: "h-4 w-4" });
  if (category?.includes('park') || category?.includes('garden') || category?.includes('recreation')) return React.createElement(Trees, { className: "h-4 w-4" });
  if (category?.includes('bus') || category?.includes('train') || category?.includes('transport')) return React.createElement(Bus, { className: "h-4 w-4" });
  if (category?.includes('entertainment') || category?.includes('music') || category?.includes('theater')) return React.createElement(MusicIcon, { className: "h-4 w-4" });
  if (category?.includes('sports') || category?.includes('gym') || category?.includes('fitness')) return React.createElement(Dumbbell, { className: "h-4 w-4" });
  if (category?.includes('religious') || category?.includes('church') || category?.includes('temple')) return React.createElement(Church, { className: "h-4 w-4" });
  if (category?.includes('library') || category?.includes('museum')) return React.createElement(LibraryBig, { className: "h-4 w-4" });
  
  // Check for place types
  if (placeType === 'poi') return React.createElement(Landmark, { className: "h-4 w-4" });
  if (placeType === 'address') return React.createElement(Home, { className: "h-4 w-4" });
  if (placeType === 'place') return React.createElement(Navigation, { className: "h-4 w-4" });
  if (placeType === 'neighborhood' || placeType === 'locality') return React.createElement(Navigation, { className: "h-4 w-4" });
  
  // Default icon
  return React.createElement(MapPin, { className: "h-4 w-4" });
};

// Format place name with additional context and category information
export const formatPlaceName = (place: any): React.ReactElement => {
  const mainText = place.text;
  const category = place.properties?.category || '';
  const address = place.properties?.address || '';
  
  // Join context items, excluding the first one (which is often the city/region already shown in mainText)
  const contextItems = place.context?.map((c: any) => c.text).filter(Boolean) || [];
  const context = contextItems.join(', ');
  
  // Build the component structure for place name display using React.createElement instead of JSX
  return React.createElement('div', {}, [
    React.createElement('div', { className: "font-medium", key: "main" }, mainText),
    category && React.createElement('div', { className: "text-xs font-medium text-primary/80", key: "category" }, category),
    address && React.createElement('div', { className: "text-xs text-gray-400", key: "address" }, address),
    context && React.createElement('div', { className: "text-xs text-gray-400", key: "context" }, context)
  ].filter(Boolean));
};

// Function to build parameters for Mapbox geocoding API
export const buildMapboxParams = (query: string) => {
  return new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    country: 'br',
    language: 'pt',
    limit: '8',
    types: POI_TYPES,
    proximity: '-43.1729,-22.9068', // Rio de Janeiro as default center
    bbox: '-73.9872354,-33.7683777,-34.7299934,5.24448639', // Brazil's bounding box
    fuzzyMatch: 'true',
  });
};

// Function to fetch address suggestions from Mapbox API
export const fetchAddressSuggestions = async (query: string) => {
  if (query.length < 3) return [];
  
  try {
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
    const params = buildMapboxParams(query);
    
    const response = await fetch(`${endpoint}?${params.toString()}`);
    const data = await response.json();
    
    return data.features || [];
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    return [];
  }
};
