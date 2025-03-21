
import { toast } from 'sonner';
import { GOOGLE_MAPS_API_KEY, isGoogleMapsLoaded } from './config';

// Variáveis para rastrear se o script do Google Maps já está carregado ou em processo de carregamento
let googleMapsScriptLoading = false;
let googleMapsScriptLoaded = false;
let loadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;

// Load Google Maps script dynamically with improved error handling
export const loadGoogleMapsScript = async (): Promise<void> => {
  // Se o script já estiver carregado, retorna imediatamente
  if (isGoogleMapsLoaded()) {
    console.log('Google Maps API já carregada');
    googleMapsScriptLoaded = true;
    return Promise.resolve();
  }
  
  // Se o script estiver em processo de carregamento, aguarda
  if (googleMapsScriptLoading) {
    console.log('Google Maps API já está carregando, aguardando...');
    return new Promise((resolve, reject) => {
      const checkLoaded = setInterval(() => {
        if (googleMapsScriptLoaded || isGoogleMapsLoaded()) {
          clearInterval(checkLoaded);
          googleMapsScriptLoaded = true;
          resolve();
        } else if (!googleMapsScriptLoading) {
          clearInterval(checkLoaded);
          reject('O carregamento do script do Google Maps foi interrompido');
        }
      }, 200);
      
      // Timeout após 10 segundos para evitar espera infinita
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!googleMapsScriptLoaded && !isGoogleMapsLoaded()) {
          googleMapsScriptLoading = false;
          reject('Timeout ao aguardar carregamento do Google Maps');
        }
      }, 10000);
    });
  }
  
  // Verificar limite de tentativas
  if (loadAttempts >= MAX_LOAD_ATTEMPTS) {
    console.error(`Excedido o limite de ${MAX_LOAD_ATTEMPTS} tentativas de carregamento do Google Maps`);
    return Promise.reject('Máximo de tentativas de carregamento excedido');
  }
  
  loadAttempts++;
  googleMapsScriptLoading = true;
  
  return new Promise((resolve, reject) => {
    try {
      // Verifica se o script já existe para evitar duplicações
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
      
      // Criar o elemento de script
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps&language=pt-BR&region=BR`;
      script.async = true;
      script.defer = true;
      
      // Configurar temporizador para detectar carregamento muito lento
      const loadTimeout = setTimeout(() => {
        console.warn('Carregamento do Google Maps está demorando mais do que o esperado');
      }, 5000);
      
      // Definir a função de callback global
      window.initGoogleMaps = () => {
        clearTimeout(loadTimeout);
        console.log('Google Maps API carregada com sucesso');
        googleMapsScriptLoaded = true;
        googleMapsScriptLoading = false;
        resolve();
      };
      
      // Manipular erros de carregamento
      script.onerror = (event) => {
        clearTimeout(loadTimeout);
        console.error('Falha ao carregar Google Maps API, pode ser necessário habilitar a cobrança ou verificar as restrições da chave API', event);
        
        if (loadAttempts === 1) {
          toast.error("Erro ao carregar recursos do mapa. As funcionalidades de endereço podem estar limitadas.", {
            duration: 5000,
            description: "Verificando métodos alternativos..."
          });
        }
        
        googleMapsScriptLoading = false;
        reject('Falha ao carregar Google Maps API');
      };
      
      document.head.appendChild(script);
      
      // Adicionar um timeout como garantia extra
      setTimeout(() => {
        if (googleMapsScriptLoading && !googleMapsScriptLoaded && !isGoogleMapsLoaded()) {
          console.error('Timeout ao carregar o Google Maps API');
          googleMapsScriptLoading = false;
          reject('Timeout ao carregar o Google Maps API');
        }
      }, 15000);
      
    } catch (error) {
      googleMapsScriptLoading = false;
      reject(error);
    }
  });
};
