
import { toast } from 'sonner';
import { GOOGLE_MAPS_API_KEY, isGoogleMapsLoaded } from './config';

// Variáveis para rastrear se o script do Google Maps já está carregado ou em processo de carregamento
let googleMapsScriptLoading = false;
let googleMapsScriptLoaded = false;

// Load Google Maps script dynamically
export const loadGoogleMapsScript = async (): Promise<void> => {
  // Se o script já estiver carregado, retorna imediatamente
  if (isGoogleMapsLoaded()) {
    console.log('Google Maps API already loaded');
    return Promise.resolve();
  }
  
  // Se o script estiver em processo de carregamento, aguarda
  if (googleMapsScriptLoading) {
    console.log('Google Maps API already loading, waiting...');
    return new Promise((resolve, reject) => {
      const checkIfLoaded = () => {
        if (googleMapsScriptLoaded) {
          resolve();
        } else if (!googleMapsScriptLoading) {
          reject('Google Maps script loading was aborted');
        } else {
          setTimeout(checkIfLoaded, 100);
        }
      };
      setTimeout(checkIfLoaded, 100);
    });
  }
  
  // Marca o início do carregamento
  googleMapsScriptLoading = true;
  
  return new Promise((resolve, reject) => {
    try {
      // Verifica se o script já existe para evitar duplicações
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
      
      // Create the script element
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=pt-BR&region=BR&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      // Define a função de callback global
      window.initGoogleMaps = () => {
        console.log('Google Maps API loaded successfully');
        googleMapsScriptLoaded = true;
        googleMapsScriptLoading = false;
        resolve();
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Maps API, may need to enable billing or check API key restrictions');
        toast.error("Erro ao carregar a API do Google Maps. Usando recursos de fallback para sugestões de endereço.", {
          duration: 5000,
        });
        googleMapsScriptLoading = false;
        reject('Failed to load Google Maps API');
      };
      
      document.head.appendChild(script);
    } catch (error) {
      googleMapsScriptLoading = false;
      reject(error);
    }
  });
};
