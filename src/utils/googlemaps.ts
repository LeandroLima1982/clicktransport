import React from 'react';
import { Building, Landmark, Home, Navigation, MapPin, ShoppingBag, School, Hospital, Hotel, Coffee, Utensils, Bus, Plane, Dumbbell, Church, Trees } from 'lucide-react';
import { toast } from 'sonner';

// Extend the Window interface to include our callback
declare global {
  interface Window {
    initGoogleMaps?: () => void;
    GOOGLE_MAPS_API_KEY?: string; // Para armazenar a chave globalmente
  }
}

// Get the API key from localStorage or use a default placeholder
export const getGoogleMapsApiKey = (): string => {
  // Primeiro, verifique se existe uma chave global atualizada na memória
  if (window.GOOGLE_MAPS_API_KEY) {
    return window.GOOGLE_MAPS_API_KEY;
  }
  
  // Depois, tente recuperar do localStorage
  const storedKey = localStorage.getItem('GOOGLE_MAPS_API_KEY');
  
  // Se encontrou uma chave, armazene-a globalmente para uso futuro
  if (storedKey && storedKey.length > 20) {
    window.GOOGLE_MAPS_API_KEY = storedKey;
    return storedKey;
  }
  
  return 'YOUR_GOOGLE_MAPS_API_KEY';
};

// Export the Google Maps API token - Obtenha a chave dinamicamente a cada chamada
export const GOOGLE_MAPS_API_KEY = getGoogleMapsApiKey();

// Check if token is valid
export const isValidApiKey = () => {
  // Obtenha a chave mais recente a cada verificação
  const apiKey = getGoogleMapsApiKey();
  const isValid = apiKey && 
         apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY' && 
         apiKey.length > 20;
         
  if (!isValid) {
    console.error('Chave da API do Google Maps inválida - Atualize a chave nas configurações');
  }
  
  return isValid;
};

// Function to load Google Maps API script with better error handling
export const loadGoogleMapsScript = (callback: () => void) => {
  // Check if API key is valid
  if (!isValidApiKey()) {
    console.error('Invalid Google Maps API key - Please update it to use map features');
    toast.error('Chave da API do Google Maps inválida', {
      description: 'Configure a chave nas configurações da aplicação',
      duration: 5000,
    });
    return;
  }

  // Get the current API key (might have been updated since page load)
  const currentApiKey = getGoogleMapsApiKey();

  // Check if script is already loaded
  if (window.google && window.google.maps) {
    console.log('Google Maps API already loaded, executing callback');
    callback();
    return;
  }

  console.log('Loading Google Maps API script with key:', currentApiKey.substring(0, 5) + '...');

  // Create script element
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${currentApiKey}&libraries=places&callback=initGoogleMaps`;
  script.async = true;
  script.defer = true;
  
  // Define callback
  window.initGoogleMaps = () => {
    console.log('Google Maps API loaded successfully');
    callback();
  };
  
  // Handle script errors
  script.onerror = (error) => {
    console.error('Error loading Google Maps API:', error);
    toast.error('Erro ao carregar a API do Google Maps');
  };
  
  document.head.appendChild(script);
};

// Create a function to generate icon props
const createIconProps = (IconComponent: any, iconSize: string, color: string) => {
  return {
    icon: IconComponent,
    className: `${iconSize} ${color}`
  };
};

// Get icon props based on place type
export const getPlaceIconProps = (placeType: string) => {
  const iconSize = "h-4 w-4";
  
  // Map place types to icons
  switch (typeof placeType === 'string' ? placeType : 'address') {
    case 'airport':
      return createIconProps(Plane, iconSize, 'text-blue-600');
    case 'lodging':
    case 'hotel':
      return createIconProps(Hotel, iconSize, 'text-amber-600');
    case 'restaurant':
    case 'food':
    case 'cafe':
      return createIconProps(Utensils, iconSize, 'text-red-600');
    case 'store':
    case 'shopping_mall':
      return createIconProps(ShoppingBag, iconSize, 'text-purple-600');
    case 'school':
    case 'university':
      return createIconProps(School, iconSize, 'text-blue-500');
    case 'hospital':
    case 'health':
      return createIconProps(Hospital, iconSize, 'text-red-500');
    case 'park':
      return createIconProps(Trees, iconSize, 'text-green-600');
    case 'transit_station':
    case 'bus_station':
      return createIconProps(Bus, iconSize, 'text-blue-500');
    case 'point_of_interest':
      return createIconProps(Landmark, iconSize, 'text-amber-500');
    case 'establishment':
      return createIconProps(Building, iconSize, 'text-gray-600');
    case 'address':
    default:
      return createIconProps(Home, iconSize, 'text-gray-500');
  }
};

// For backward compatibility with existing code
export const getPlaceIcon = (placeType: string): any => {
  const iconProps = getPlaceIconProps(placeType);
  const IconComponent = iconProps.icon;
  // This will need to be rendered by a React component that uses this function
  return { IconComponent, className: iconProps.className };
};

// Format place name data for display
export const formatPlaceNameData = (place: google.maps.places.AutocompletePrediction) => {
  const mainText = place.structured_formatting?.main_text || place.description;
  const secondaryText = place.structured_formatting?.secondary_text || '';
  
  return {
    mainText,
    secondaryText
  };
};

// For backward compatibility
export const formatPlaceName = formatPlaceNameData;

// Function to fetch address suggestions from Google Maps Places API
export const fetchAddressSuggestions = async (query: string): Promise<google.maps.places.AutocompletePrediction[]> => {
  if (query.length < 3) return [];
  
  if (!isValidApiKey()) {
    console.error('Invalid Google Maps API key. Check your configuration.');
    toast.error('Chave da API do Google Maps inválida');
    return [];
  }
  
  console.log('Fetching address suggestions for:', query);
  
  return new Promise((resolve) => {
    loadGoogleMapsScript(() => {
      try {
        const autocompleteService = new google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions(
          {
            input: query,
            componentRestrictions: { country: 'br' },
            types: ['address', 'establishment', 'geocode']
          },
          (predictions, status) => {
            console.log('Places API status:', status);
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              console.log('Found suggestions:', predictions.length);
              resolve(predictions);
            } else {
              console.error('Google Places API error:', status);
              resolve([]);
            }
          }
        );
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        resolve([]);
      }
    });
  });
};

// Calculate route between two locations
export interface RouteInfo {
  distance: number; // in kilometers
  duration: number; // in minutes
  geometry?: any;
}

export const calculateRoute = async (
  origin: string,
  destination: string
): Promise<RouteInfo | null> => {
  if (!origin || !destination) {
    console.log('Origin or destination is empty');
    return null;
  }
  
  if (!isValidApiKey()) {
    console.error('Invalid Google Maps API key for route calculation');
    toast.error('Chave da API do Google Maps inválida');
    return null;
  }
  
  console.log('Calculating route from', origin, 'to', destination);
  
  return new Promise((resolve) => {
    loadGoogleMapsScript(() => {
      try {
        const directionsService = new google.maps.DirectionsService();
        
        directionsService.route(
          {
            origin,
            destination,
            travelMode: google.maps.TravelMode.DRIVING
          },
          (result, status) => {
            console.log('Directions API status:', status);
            if (status === google.maps.DirectionsStatus.OK && result) {
              const route = result.routes[0].legs[0];
              
              // Convert distance from meters to kilometers
              const distanceKm = (route.distance?.value || 0) / 1000;
              
              // Convert duration from seconds to minutes
              const durationMin = Math.ceil((route.duration?.value || 0) / 60);
              
              console.log('Route calculated successfully:', distanceKm, 'km,', durationMin, 'min');
              
              resolve({
                distance: parseFloat(distanceKm.toFixed(2)),
                duration: durationMin,
                geometry: {
                  type: 'LineString',
                  coordinates: result.routes[0].overview_path.map(point => [point.lng(), point.lat()])
                }
              });
            } else {
              console.error('Directions API error:', status);
              toast.error('Erro ao calcular rota');
              resolve(null);
            }
          }
        );
      } catch (error) {
        console.error('Error calculating route:', error);
        resolve(null);
      }
    });
  });
};

// Get coordinates from an address
export const getCoordinatesFromAddress = async (address: string): Promise<[number, number] | null> => {
  if (!address || !isValidApiKey()) return null;
  
  console.log('Getting coordinates for address:', address);
  
  return new Promise((resolve) => {
    loadGoogleMapsScript(() => {
      try {
        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode(
          { address: address, region: 'br' },
          (results, status) => {
            console.log('Geocoding status:', status);
            if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
              const location = results[0].geometry.location;
              console.log('Coordinates found:', location.lng(), location.lat());
              resolve([location.lng(), location.lat()]);
            } else {
              console.error('Geocoding error:', status);
              resolve(null);
            }
          }
        );
      } catch (error) {
        console.error('Error geocoding address:', error);
        resolve(null);
      }
    });
  });
};
