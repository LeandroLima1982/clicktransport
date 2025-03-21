
import React from 'react';
import { Building, Landmark, Home, Navigation, MapPin, ShoppingBag, School, Hospital, Hotel, Coffee, Utensils, Bus, Plane, Music as MusicIcon, Dumbbell, Church, Library as LibraryBig, Trees } from 'lucide-react';

// Extend the Window interface to include our callback
declare global {
  interface Window {
    initGoogleMaps?: () => void;
  }
}

// Export the Google Maps API token - usando uma chave válida, você deve trocar por sua chave real
export const GOOGLE_MAPS_API_KEY = 'AIzaSyCz1o0MT2uHrlXvBvuJWkGwKA9NbESKsew';

// Check if token is valid - corrigido o método de verificação
export const isValidApiKey = () => {
  return GOOGLE_MAPS_API_KEY && !GOOGLE_MAPS_API_KEY.includes('YOUR_') && GOOGLE_MAPS_API_KEY.length > 20;
};

// Function to load Google Maps API script
export const loadGoogleMapsScript = (callback: () => void) => {
  // Verificação de API válida
  if (!isValidApiKey()) {
    console.error('Google Maps API key is missing or invalid - map functionality will not work!');
    return;
  }

  // Check if script is already loaded
  if (window.google && window.google.maps) {
    callback();
    return;
  }

  console.log('Loading Google Maps API script with key', GOOGLE_MAPS_API_KEY.substring(0, 10) + '...');

  // Create script element
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
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
  };
  
  document.head.appendChild(script);
};

// Function type for getPlaceIcon
type IconComponent = React.ReactElement;

// Get icon based on place type
export const getPlaceIcon = (placeType: string | google.maps.places.AutocompletePrediction): IconComponent => {
  // Extract type from prediction if needed
  const type = typeof placeType === 'string' 
    ? placeType 
    : (placeType.types && placeType.types[0]) || 'address';
  
  // Map Google place types to icons
  switch (type) {
    case 'airport':
      return React.createElement(Plane, { className: "h-4 w-4 text-blue-600" });
    case 'lodging':
    case 'hotel':
      return React.createElement(Hotel, { className: "h-4 w-4 text-amber-600" });
    case 'restaurant':
    case 'food':
    case 'cafe':
      return React.createElement(Utensils, { className: "h-4 w-4 text-red-600" });
    case 'store':
    case 'shopping_mall':
      return React.createElement(ShoppingBag, { className: "h-4 w-4 text-purple-600" });
    case 'school':
    case 'university':
      return React.createElement(School, { className: "h-4 w-4 text-blue-500" });
    case 'hospital':
    case 'health':
      return React.createElement(Hospital, { className: "h-4 w-4 text-red-500" });
    case 'park':
      return React.createElement(Trees, { className: "h-4 w-4 text-green-600" });
    case 'transit_station':
    case 'bus_station':
      return React.createElement(Bus, { className: "h-4 w-4 text-blue-500" });
    case 'point_of_interest':
      return React.createElement(Landmark, { className: "h-4 w-4 text-amber-500" });
    case 'address':
      return React.createElement(Home, { className: "h-4 w-4 text-gray-500" });
    default:
      return React.createElement(MapPin, { className: "h-4 w-4 text-gray-500" });
  }
};

// Format place details for display
export const formatPlaceName = (place: google.maps.places.AutocompletePrediction): React.ReactElement => {
  const mainText = place.structured_formatting?.main_text || place.description;
  const secondaryText = place.structured_formatting?.secondary_text || '';
  
  return React.createElement('div', {}, [
    React.createElement('div', { className: "font-medium", key: "main" }, mainText),
    secondaryText && React.createElement('div', { className: "text-xs text-gray-600", key: "context" }, secondaryText)
  ].filter(Boolean));
};

// Function to fetch address suggestions from Google Maps Places API
export const fetchAddressSuggestions = async (query: string): Promise<any[]> => {
  if (query.length < 3) return [];
  
  if (!isValidApiKey()) {
    console.error('Invalid Google Maps API key. Check your configuration.');
    return [];
  }
  
  console.log('Fetching address suggestions for:', query);
  
  // Ensure Google Maps API is loaded
  return new Promise((resolve) => {
    loadGoogleMapsScript(() => {
      try {
        console.log('Google Maps loaded, fetching predictions...');
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
              console.log('Google Places suggestions:', predictions.length);
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
    return null;
  }
  
  console.log('Calculating route from', origin, 'to', destination);
  
  return new Promise((resolve) => {
    loadGoogleMapsScript(() => {
      try {
        console.log('Maps loaded, calculating directions...');
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
