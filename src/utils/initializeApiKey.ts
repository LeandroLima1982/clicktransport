
import { toast } from 'sonner';

// Initialize Google Maps API key from localStorage if available
export const initializeApiKeyFromStorage = (): void => {
  try {
    // Check if we have a stored API key
    const storedApiKey = localStorage.getItem('GOOGLE_MAPS_API_KEY');
    
    if (storedApiKey && storedApiKey.length > 20) {
      console.log('Loaded Google Maps API key from localStorage');
      
      // This will be automatically used by our application
      // The key is accessed via the getStoredApiKey function 
      // whenever we need to use the Google Maps API
    } else {
      console.log('No valid Google Maps API key found in localStorage');
    }
  } catch (error) {
    console.error('Error initializing API key from storage:', error);
  }
};

// Call this function from your main.tsx file or App.tsx
// initializeApiKeyFromStorage();
