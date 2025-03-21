
import { toast } from 'sonner';

// Google Maps API key - usando a chave fornecida pelo usuário
export const GOOGLE_MAPS_API_KEY = 'AIzaSyCg71Bf3HBZDsFPQgWDBnWlwqBSSrKKe_A';

// Verificar se a chave API é válida
const validateApiKey = (key: string): boolean => {
  // Uma chave API válida do Google tem pelo menos 20 caracteres
  return key && key.length >= 20;
};

// Log de avisos sobre a API key
if (!validateApiKey(GOOGLE_MAPS_API_KEY)) {
  console.error('Chave API do Google Maps inválida ou muito curta!');
  toast.error('Chave API do Google Maps inválida', {
    description: 'Entre em contato com o suporte para resolver este problema'
  });
}

// Esta função é mantida por compatibilidade
export const setGoogleMapsApiKey = (key: string) => {
  console.log('Chave API já definida internamente, não é possível alterar');
};

// Check if API key is set
export const isGoogleMapsApiKeySet = (): boolean => {
  return validateApiKey(GOOGLE_MAPS_API_KEY);
};

// Type guard to check if the Google Maps API is loaded
export const isGoogleMapsLoaded = (): boolean => {
  const isLoaded = typeof window !== 'undefined' && 
         typeof window.google !== 'undefined' && 
         typeof window.google.maps !== 'undefined';
         
  // Verificar módulos específicos que utilizamos
  const hasPlaces = isLoaded && typeof window.google.maps.places !== 'undefined';
  const hasDirections = isLoaded && typeof window.google.maps.DirectionsService !== 'undefined';
  const hasGeocoder = isLoaded && typeof window.google.maps.Geocoder !== 'undefined';
  
  if (isLoaded && (!hasPlaces || !hasDirections || !hasGeocoder)) {
    console.warn('Google Maps API parcialmente carregada. Alguns recursos podem não funcionar.');
  }
  
  return isLoaded;
};

// Declare global types
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}
