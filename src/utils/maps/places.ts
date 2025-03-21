
import React from 'react';
import { 
  Building, Landmark, Home, Navigation, MapPin, ShoppingBag, 
  School, Hospital, Hotel, Coffee, Utensils, Bus, Plane, 
  Music as MusicIcon, Dumbbell, Church, Library as LibraryBig, Trees 
} from 'lucide-react';
import { loadGoogleMapsScript } from './loader';
import { isGoogleMapsLoaded, GOOGLE_MAPS_API_KEY } from './config';
import { toast } from 'sonner';

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

// Improved fallback suggestions with real cities and more structured data
const getFallbackSuggestions = (query: string): any[] => {
  if (!query || query.length < 3) return [];
  
  const majorCities = [
    { name: 'Rio de Janeiro', state: 'RJ', country: 'Brasil' },
    { name: 'São Paulo', state: 'SP', country: 'Brasil' },
    { name: 'Belo Horizonte', state: 'MG', country: 'Brasil' },
    { name: 'Brasília', state: 'DF', country: 'Brasil' },
    { name: 'Salvador', state: 'BA', country: 'Brasil' },
    { name: 'Recife', state: 'PE', country: 'Brasil' },
    { name: 'Fortaleza', state: 'CE', country: 'Brasil' },
    { name: 'Curitiba', state: 'PR', country: 'Brasil' },
    { name: 'Porto Alegre', state: 'RS', country: 'Brasil' }
  ];
  
  // For better fallback suggestions, try to extract potential street info
  const words = query.trim().split(' ');
  const potentialStreet = words.slice(0, Math.min(3, words.length)).join(' ');
  
  return majorCities.map((city, index) => ({
    place_id: `fallback-${index}`,
    description: `${potentialStreet}, ${city.name}, ${city.state}, ${city.country}`,
    structured_formatting: {
      main_text: potentialStreet,
      secondary_text: `${city.name}, ${city.state}, ${city.country}`
    },
    types: ['street_address'],
    fallback: true
  }));
};

// Debug helper
const logPlacesApiError = (status: string, query: string) => {
  const statusMap: {[key: string]: string} = {
    'ZERO_RESULTS': 'Nenhum resultado encontrado para a consulta.',
    'OVER_QUERY_LIMIT': 'Limite de consultas excedido. Verifique a faturação da API.',
    'REQUEST_DENIED': 'A solicitação foi negada. Verifique as configurações da chave API.',
    'INVALID_REQUEST': 'Solicitação inválida.',
    'UNKNOWN_ERROR': 'Erro desconhecido do servidor Google.',
  };
  
  const message = statusMap[status] || `Erro na API Places (${status})`;
  console.warn(`Places API para "${query}": ${message}`);
};

// Improved address suggestion function with better error handling
export const fetchAddressSuggestions = async (query: string): Promise<any[]> => {
  if (!query || query.length < 3) return [];
  
  console.log(`Buscando sugestões para: "${query}"`);
  
  try {
    // Carregar o script do Google Maps antes de tudo
    try {
      await loadGoogleMapsScript();
    } catch (error) {
      console.error('Falha ao carregar Google Maps API:', error);
      return getFallbackSuggestions(query);
    }
    
    // Verificar se a API do Google Maps foi carregada corretamente
    if (!isGoogleMapsLoaded()) {
      console.warn('Google Maps API não foi carregada corretamente, usando sugestões alternativas');
      return getFallbackSuggestions(query);
    }
    
    // Verifica se temos a API de Places disponível
    if (!window.google?.maps?.places) {
      console.error('Google Maps Places API não está disponível');
      return getFallbackSuggestions(query);
    }
    
    return new Promise<any[]>((resolve) => {
      try {
        const service = new window.google.maps.places.AutocompleteService();
        const sessionToken = new window.google.maps.places.AutocompleteSessionToken();
        
        service.getPlacePredictions({
          input: query,
          componentRestrictions: { country: 'br' },
          types: ['address', 'establishment', 'geocode'],
          language: 'pt-BR',
          sessionToken: sessionToken
        }, (predictions, status) => {
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions || predictions.length === 0) {
            logPlacesApiError(status, query);
            resolve(getFallbackSuggestions(query));
            return;
          }
          
          console.log(`Recebidas ${predictions.length} sugestões do Google para "${query}"`);
          resolve(predictions);
        });
      } catch (error) {
        console.error('Erro com Google Places API:', error);
        resolve(getFallbackSuggestions(query));
      }
    });
  } catch (error) {
    console.error('Erro ao buscar sugestões de endereço:', error);
    return getFallbackSuggestions(query);
  }
};
