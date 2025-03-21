
import React from 'react';
import { 
  Building, Landmark, Home, Navigation, MapPin, ShoppingBag, 
  School, Hospital, Hotel, Coffee, Utensils, Bus, Plane, 
  Music as MusicIcon, Dumbbell, Church, Library as LibraryBig, Trees 
} from 'lucide-react';

// Google Maps API key - usando a chave fornecida diretamente
export const GOOGLE_MAPS_API_KEY = 'AIzaSyCz1o0MT2uHrlXvBvuJWkGwKA9NbESKsew';

// Esta função é mantida por compatibilidade, mas já não é necessária
export const setGoogleMapsApiKey = (key: string) => {
  console.log('API key already set internally');
  // Não alteramos a chave, pois já está definida internamente
};

// Check if API key is set
export const isGoogleMapsApiKeySet = (): boolean => {
  return true; // Sempre retorna true já que a chave está definida internamente
};

// Get icon for place based on place type
export const getPlaceIcon = (place: any): React.ReactElement => {
  const types = place.types || [];
  
  // Check for specific types
  if (types.includes('airport')) return React.createElement(Plane, { className: "h-4 w-4 text-blue-600" });
  if (types.includes('lodging') || types.includes('hotel')) return React.createElement(Hotel, { className: "h-4 w-4 text-amber-600" });
  if (types.includes('restaurant') || types.includes('food')) return React.createElement(Utensils, { className: "h-4 w-4 text-red-600" });
  if (types.includes('cafe')) return React.createElement(Coffee, { className: "h-4 w-4 text-amber-700" });
  if (types.includes('store') || types.includes('shopping_mall')) return React.createElement(ShoppingBag, { className: "h-4 w-4 text-purple-600" });
  if (types.includes('school') || types.includes('university')) return React.createElement(School, { className: "h-4 w-4 text-blue-500" });
  if (types.includes('hospital') || types.includes('health')) return React.createElement(Hospital, { className: "h-4 w-4 text-red-500" });
  if (types.includes('park')) return React.createElement(Trees, { className: "h-4 w-4 text-green-600" });
  if (types.includes('bus_station') || types.includes('transit_station')) return React.createElement(Bus, { className: "h-4 w-4 text-blue-500" });
  if (types.includes('point_of_interest')) return React.createElement(Landmark, { className: "h-4 w-4 text-amber-500" });
  if (types.includes('street_address')) return React.createElement(Home, { className: "h-4 w-4 text-gray-500" });
  
  // Default icon
  return React.createElement(MapPin, { className: "h-4 w-4 text-gray-500" });
};

// Format place name for display
export const formatPlaceName = (place: any): React.ReactElement => {
  const mainText = place.structured_formatting?.main_text || place.name || '';
  const secondaryText = place.structured_formatting?.secondary_text || '';
  
  return React.createElement('div', {}, [
    React.createElement('div', { className: "font-medium", key: "main" }, mainText),
    secondaryText && React.createElement('div', { className: "text-xs text-gray-600", key: "secondary" }, secondaryText)
  ].filter(Boolean));
};

// Type guard to check if the Google Maps API is loaded
const isGoogleMapsLoaded = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.google !== 'undefined' && 
         typeof window.google.maps !== 'undefined' &&
         typeof window.google.maps.places !== 'undefined';
};

// Fallback suggestions when API fails
const getFallbackSuggestions = (query: string): any[] => {
  if (!query || query.length < 3) return [];
  
  // Create some generic suggestions based on the user input
  return [
    {
      place_id: 'fallback-1',
      description: `${query}, Rio de Janeiro, Brasil`,
      structured_formatting: {
        main_text: query,
        secondary_text: 'Rio de Janeiro, Brasil'
      },
      types: ['street_address']
    },
    {
      place_id: 'fallback-2',
      description: `${query}, São Paulo, Brasil`,
      structured_formatting: {
        main_text: query,
        secondary_text: 'São Paulo, Brasil'
      },
      types: ['street_address']
    }
  ];
};

// Fetch address suggestions
export const fetchAddressSuggestions = async (query: string): Promise<any[]> => {
  if (!GOOGLE_MAPS_API_KEY || query.length < 3) return [];
  
  try {
    console.log("Fetching Google Maps suggestions for:", query);
    
    // Using browser's built-in Autocomplete API (requires the script to be loaded)
    if (!isGoogleMapsLoaded()) {
      console.log('Google Maps Places API not loaded, attempting to load it');
      try {
        await loadGoogleMapsScript();
      } catch (error) {
        console.error('Failed to load Google Maps API:', error);
        // Return fallback suggestions when API can't be loaded
        return getFallbackSuggestions(query);
      }
      
      if (!isGoogleMapsLoaded()) {
        console.warn('Google Maps Places API failed to load, using fallback suggestions');
        return getFallbackSuggestions(query);
      }
    }
    
    return new Promise((resolve) => {
      const service = new window.google.maps.places.AutocompleteService();
      
      service.getPlacePredictions({
        input: query,
        componentRestrictions: { country: 'br' },
        types: ['address', 'establishment', 'geocode'],
        language: 'pt-BR'
      }, (predictions, status) => {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
          console.warn('Google Places API returned:', status);
          // If the API fails, use our fallback suggestions
          resolve(getFallbackSuggestions(query));
          return;
        }
        
        console.log("Received Google suggestions:", predictions.length);
        resolve(predictions);
      });
    });
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    return getFallbackSuggestions(query);
  }
};

// Calculate route between two addresses
export const calculateRoute = async (
  origin: string,
  destination: string
): Promise<{
  distance: number; // in kilometers
  duration: number; // in minutes
  geometry?: any;
} | null> => {
  if (!GOOGLE_MAPS_API_KEY) return null;
  
  try {
    // First get geocodes for the addresses
    const originCoords = await geocodeAddress(origin);
    const destinationCoords = await geocodeAddress(destination);
    
    if (!originCoords || !destinationCoords) {
      console.error('Failed to geocode addresses');
      return null;
    }
    
    // Now get the route
    return new Promise((resolve) => {
      if (!isGoogleMapsLoaded()) {
        console.error('Google Maps Directions API not loaded');
        resolve(null);
        return;
      }
      
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route({
        origin: originCoords,
        destination: destinationCoords,
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status !== window.google.maps.DirectionsStatus.OK || !result) {
          console.error('Directions request failed:', status);
          resolve(null);
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
    console.error('Error calculating route:', error);
    return null;
  }
};

// Geocode an address to coordinates
export const geocodeAddress = async (address: string): Promise<google.maps.LatLng | null> => {
  if (!GOOGLE_MAPS_API_KEY) return null;
  
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

// Load Google Maps script dynamically
export const loadGoogleMapsScript = async (): Promise<void> => {
  // Não precisamos verificar se a chave está definida, pois já sabemos que está
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (isGoogleMapsLoaded()) {
      return resolve();
    }
    
    // Create the script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=pt-BR&region=BR`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps API loaded successfully');
      resolve();
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Maps API, may need to enable billing or check API key restrictions');
      reject('Failed to load Google Maps API');
    };
    
    document.head.appendChild(script);
  });
};
