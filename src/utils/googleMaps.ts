
import React from 'react';
import { 
  Building, Landmark, Home, Navigation, MapPin, ShoppingBag, 
  School, Hospital, Hotel, Coffee, Utensils, Bus, Plane, 
  Music as MusicIcon, Dumbbell, Church, Library as LibraryBig, Trees 
} from 'lucide-react';
import { toast } from 'sonner';

// Google Maps API key - usando a chave fornecida pelo usuário
export const GOOGLE_MAPS_API_KEY = 'AIzaSyCg71Bf3HBZDsFPQgWDBnWlwqBSSrKKe_A';

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
  const mainText = place.structured_formatting?.main_text || place.name || place.description?.split(',')[0] || '';
  const secondaryText = place.structured_formatting?.secondary_text || 
    (place.description ? place.description.substring(place.description.indexOf(',') + 1).trim() : '');
  
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

// Melhoria nos fallback suggestions com mais cidades e tipos
const getFallbackSuggestions = (query: string): any[] => {
  if (!query || query.length < 3) return [];
  
  // Extrai as primeiras palavras para aumentar a chance de correspondência
  const words = query.split(' ');
  const searchTerm = words.length > 2 ? `${words[0]} ${words[1]}` : query;
  
  const majorCities = [
    'Rio de Janeiro', 'São Paulo', 'Belo Horizonte', 'Brasília', 
    'Salvador', 'Recife', 'Fortaleza', 'Curitiba', 'Porto Alegre',
    'Manaus', 'Belém', 'Goiânia', 'Guarulhos', 'Campinas'
  ];
  
  // Crie sugestões com as principais cidades
  return majorCities.slice(0, 5).map((city, index) => ({
    place_id: `fallback-${index}`,
    description: `${searchTerm}, ${city}, Brasil`,
    structured_formatting: {
      main_text: searchTerm,
      secondary_text: `${city}, Brasil`
    },
    types: ['street_address'],
    fallback: true
  }));
};

// Improved address suggestion function with better fallbacks
export const fetchAddressSuggestions = async (query: string): Promise<any[]> => {
  if (!query || query.length < 3) return [];
  
  try {
    console.log("Fetching Google Maps suggestions for:", query);
    
    // Cache key for this query
    const cacheKey = `address_suggestions_${query}`;
    
    // Check if we have cached results (for repeat queries)
    const cachedResults = sessionStorage.getItem(cacheKey);
    if (cachedResults) {
      return JSON.parse(cachedResults);
    }
    
    // Using browser's built-in Autocomplete API (requires the script to be loaded)
    if (!isGoogleMapsLoaded()) {
      console.log('Google Maps Places API not loaded, attempting to load it');
      try {
        await loadGoogleMapsScript();
      } catch (error) {
        console.error('Failed to load Google Maps API:', error);
        const fallbackResults = getFallbackSuggestions(query);
        sessionStorage.setItem(cacheKey, JSON.stringify(fallbackResults));
        return fallbackResults;
      }
      
      if (!isGoogleMapsLoaded()) {
        console.warn('Google Maps Places API failed to load, using fallback suggestions');
        const fallbackResults = getFallbackSuggestions(query);
        sessionStorage.setItem(cacheKey, JSON.stringify(fallbackResults));
        return fallbackResults;
      }
    }
    
    try {
      const results = await new Promise<any[]>((resolve) => {
        const service = new window.google.maps.places.AutocompleteService();
        
        service.getPlacePredictions({
          input: query,
          componentRestrictions: { country: 'br' },
          types: ['address', 'establishment', 'geocode'],
          language: 'pt-BR'
        }, (predictions, status) => {
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
            console.warn('Google Places API returned:', status);
            const fallbackResults = getFallbackSuggestions(query);
            resolve(fallbackResults);
            return;
          }
          
          console.log("Received Google suggestions:", predictions.length);
          resolve(predictions);
        });
      });
      
      // Cache the results
      sessionStorage.setItem(cacheKey, JSON.stringify(results));
      return results;
    } catch (error) {
      console.error('Error with Google Places API:', error);
      const fallbackResults = getFallbackSuggestions(query);
      return fallbackResults;
    }
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    return getFallbackSuggestions(query);
  }
};

// Calculate estimated distance between two addresses using haversine formula when API fails
const calculateHaversineDistance = async (origin: string, destination: string): Promise<number> => {
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

// Load Google Maps script dynamically
export const loadGoogleMapsScript = async (): Promise<void> => {
  // Check if script is already loaded
  if (isGoogleMapsLoaded()) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    // Create the script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=pt-BR&region=BR`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps API loaded successfully');
      setTimeout(() => {
        // Verificar se a API está realmente disponível
        if (isGoogleMapsLoaded()) {
          resolve();
        } else {
          console.warn('Google Maps API loaded but not fully initialized');
          resolve(); // Resolve anyway to let the app continue
        }
      }, 500);
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Maps API, may need to enable billing or check API key restrictions');
      toast.error("Erro ao carregar a API do Google Maps. Usando recursos de fallback para sugestões de endereço.", {
        duration: 5000,
      });
      reject('Failed to load Google Maps API');
    };
    
    document.head.appendChild(script);
  });
};
