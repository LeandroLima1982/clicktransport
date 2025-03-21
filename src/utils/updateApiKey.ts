
import { GOOGLE_MAPS_API_KEY } from './googlemaps';
import { toast } from 'sonner';

// This function will update the API key in our application
export const updateGoogleMapsApiKey = (newApiKey: string): boolean => {
  try {
    if (!newApiKey || newApiKey.length < 20) {
      toast.error('A chave da API fornecida é inválida');
      return false;
    }
    
    console.log('Atualizando chave da API do Google Maps...');
    
    // Store in localStorage for persistence
    localStorage.setItem('GOOGLE_MAPS_API_KEY', newApiKey);
    
    // Force a global update to the GOOGLE_MAPS_API_KEY variable in memory
    // This ensures any new requests will use the updated key
    (window as any).GOOGLE_MAPS_API_KEY = newApiKey;
    
    // We need to reload the page to apply the new API key
    // This will pick up the key from localStorage on the next load
    toast.success('Chave da API atualizada. Recarregando aplicação...');
    
    // Give toast time to display before reload
    setTimeout(() => {
      window.location.reload();
    }, 1500);
    
    return true;
  } catch (error) {
    console.error('Error updating API key:', error);
    toast.error('Erro ao atualizar a chave da API');
    return false;
  }
};

// Function to get API key from localStorage or return the default
export const getStoredApiKey = (): string => {
  try {
    const storedKey = localStorage.getItem('GOOGLE_MAPS_API_KEY');
    console.log('Recuperando chave API do localStorage:', storedKey ? 'Encontrada' : 'Não encontrada');
    return storedKey || GOOGLE_MAPS_API_KEY;
  } catch (error) {
    console.error('Erro ao recuperar chave API do localStorage:', error);
    return GOOGLE_MAPS_API_KEY;
  }
};

// Initialize API key from environment variable or secret if available
export const initializeApiKey = async (): Promise<void> => {
  try {
    // Check if we already have a stored key
    const existingKey = localStorage.getItem('GOOGLE_MAPS_API_KEY');
    
    if (existingKey && existingKey.length > 20) {
      console.log('Utilizando chave da API do Google Maps armazenada no localStorage');
      
      // Set the key as a global variable to ensure it's used immediately
      (window as any).GOOGLE_MAPS_API_KEY = existingKey;
      return;
    }
    
    // Try to get key from environment variable (added through lov-secret-form)
    const envApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (envApiKey && typeof envApiKey === 'string' && envApiKey.length > 20) {
      console.log('Configurando chave da API do Google Maps a partir da variável de ambiente');
      localStorage.setItem('GOOGLE_MAPS_API_KEY', envApiKey);
      (window as any).GOOGLE_MAPS_API_KEY = envApiKey;
      toast.success('Chave da API do Google Maps configurada com sucesso!');
    } else {
      // If no key is found, show a toast to alert the user
      console.warn('Nenhuma chave da API do Google Maps válida encontrada');
      setTimeout(() => {
        toast.error('Chave da API do Google Maps inválida', {
          description: 'Configure a chave nas configurações da aplicação',
          duration: 5000,
        });
      }, 2000);
    }
  } catch (error) {
    console.error('Erro ao inicializar chave da API:', error);
  }
};

// Function to force refresh all components that use the Google Maps API
export const refreshGoogleMapsComponents = (): void => {
  // Create a custom event that components can listen for
  const event = new CustomEvent('googlemaps-api-key-updated');
  document.dispatchEvent(event);
};
