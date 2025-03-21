
// Este arquivo serve como um redirecionamento para manter compatibilidade.
// Novas implementações devem importar diretamente de @/utils/maps

import {
  GOOGLE_MAPS_API_KEY,
  setGoogleMapsApiKey,
  isGoogleMapsApiKeySet,
  isGoogleMapsLoaded,
  loadGoogleMapsScript,
  geocodeAddress,
  calculateHaversineDistance,
  calculateRoute,
  getPlaceIcon,
  formatPlaceName,
  fetchAddressSuggestions
} from './maps';

export {
  GOOGLE_MAPS_API_KEY,
  setGoogleMapsApiKey,
  isGoogleMapsApiKeySet,
  isGoogleMapsLoaded,
  loadGoogleMapsScript,
  geocodeAddress,
  calculateHaversineDistance,
  calculateRoute,
  getPlaceIcon,
  formatPlaceName,
  fetchAddressSuggestions
};
