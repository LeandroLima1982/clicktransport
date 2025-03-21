
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

// Type guard to check if the Google Maps API is loaded
export const isGoogleMapsLoaded = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.google !== 'undefined' && 
         typeof window.google.maps !== 'undefined' &&
         typeof window.google.maps.places !== 'undefined';
};

// Declare global types
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}
