
import { GOOGLE_MAPS_API_KEY } from './googlemaps';
import { toast } from 'sonner';

// This function will update the API key in our application
export const updateGoogleMapsApiKey = (newApiKey: string): boolean => {
  try {
    if (!newApiKey || newApiKey.length < 20) {
      toast.error('A chave da API fornecida é inválida');
      return false;
    }
    
    // Store in localStorage for persistence
    localStorage.setItem('GOOGLE_MAPS_API_KEY', newApiKey);
    
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
  const storedKey = localStorage.getItem('GOOGLE_MAPS_API_KEY');
  return storedKey || GOOGLE_MAPS_API_KEY;
};
