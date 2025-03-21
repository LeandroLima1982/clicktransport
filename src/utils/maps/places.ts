
import React from 'react';
import { 
  Building, Landmark, Home, Navigation, MapPin, ShoppingBag, 
  School, Hospital, Hotel, Coffee, Utensils, Bus, Plane, 
  Music as MusicIcon, Dumbbell, Church, Library as LibraryBig, Trees 
} from 'lucide-react';
import { loadGoogleMapsScript } from './loader';
import { isGoogleMapsLoaded } from './config';

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
    
    // Carrega o script do Google Maps se necessário
    if (!isGoogleMapsLoaded()) {
      console.log('Google Maps Places API not loaded, attempting to load it');
      try {
        await loadGoogleMapsScript();
        // Aguarda um momento para garantir que as APIs estejam inicializadas
        await new Promise(resolve => setTimeout(resolve, 500));
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
