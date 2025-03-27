export const MAPBOX_TOKEN = 'pk.eyJ1IjoiaW50ZWdyYXRpb25zIiwiYSI6ImNsZXhyYTB3bDBzZHQzeG82ZW04Z2lzdHIifQ.Gn1IoGg-zRmgmZxNWLdMHw';

export const fetchAddressSuggestions = async (query: string) => {
  if (!query || query.length < 3) return [];
  
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=br&types=address,place,locality,region&access_token=${MAPBOX_TOKEN}`
    );
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.features || [];
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    throw error;
  }
};

// Utility to format place names for display
export const formatPlaceName = (suggestion: any) => {
  if (!suggestion) return '';
  
  // For places with full place_name, show the full name but format it nicely
  if (suggestion.place_name) {
    // If it's a Brazilian address, try to make it more readable
    if (suggestion.place_name.includes(', Brasil')) {
      const parts = suggestion.place_name.split(', ');
      
      // If we have a street address with number
      if (parts.length > 3) {
        return `${parts[0]}, ${parts[1]}, ${parts[2]}`;
      }
      
      // If it's a city or place
      return suggestion.place_name.replace(', Brasil', '');
    }
    
    return suggestion.place_name;
  }
  
  // Fallback to text if place_name not available
  return suggestion.text || 'Local desconhecido';
};

// Get the appropriate icon based on place type
export const getPlaceIcon = (placeType: string) => {
  // We would ideally return a JSX element here, but to keep this util pure,
  // we'll return the type as a string and let the component handle the icon
  return placeType;
};

// Check if a string is a valid Brazilian CEP (postal code)
export const isBrazilianCEP = (text: string) => {
  // Remove non-numeric characters for validation
  const numericOnly = text.replace(/\D/g, '');
  
  // Valid CEP has 8 digits
  return numericOnly.length === 8;
};

// Format a CEP with the standard mask (12345-678)
export const formatCEP = (cep: string) => {
  // Remove any non-numeric characters
  const numericOnly = cep.replace(/\D/g, '');
  
  // If it has at least 5 digits, format as 12345-678
  if (numericOnly.length >= 5) {
    return `${numericOnly.substring(0, 5)}-${numericOnly.substring(5, 8)}`;
  }
  
  // If less than 5 digits, return as is
  return numericOnly;
};

// Detect what type of address format we're dealing with
export const detectAddressFormat = (text: string): 'cep' | 'street' | 'poi' | 'unknown' => {
  if (isBrazilianCEP(text)) {
    return 'cep';
  }
  
  // Check if likely a street address (contains street indicators)
  if (/rua|avenida|av\.|alameda|travessa|praça|rodovia|estrada/i.test(text)) {
    return 'street';
  }
  
  // Check if likely a point of interest
  if (/hotel|shopping|restaurante|aeroporto|terminal|estação|universidade|hospital/i.test(text)) {
    return 'poi';
  }
  
  return 'unknown';
};

// Get address suggestions based on the input type (CEP, street, etc.)
export const getAddressAutofill = async (input: string) => {
  if (isBrazilianCEP(input)) {
    // If it's a CEP, we could use a CEP API like ViaCEP
    // For simplicity, we'll just use Mapbox's geocoding
    return fetchAddressSuggestions(input);
  }
  
  // For all other types, use regular geocoding
  return fetchAddressSuggestions(input);
};

// Get user's current position using the browser's geolocation API
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  });
};

// Convert coordinates to an address using Mapbox's reverse geocoding
export const reverseGeocode = async (coords: [number, number]): Promise<string | null> => {
  try {
    const [lng, lat] = coords;
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
    );
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the first result's place_name if available
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }
    
    return null;
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return null;
  }
};

// Update the useDestinationsService hook to include required functions for admin components
export const enhanceDestinationsService = (baseService: any) => {
  return {
    ...baseService,
    error: null,
    addCity: async (city: any) => {
      console.log('Adding city:', city);
      // This would normally add a city to the database
      // For now, we'll just simulate adding it to the local state
      baseService.cities.push(city);
      return { success: true };
    },
    updateCity: async (city: any) => {
      console.log('Updating city:', city);
      // This would normally update a city in the database
      // For now, we'll just simulate updating it in the local state
      const index = baseService.cities.findIndex((c: any) => c.id === city.id);
      if (index !== -1) {
        baseService.cities[index] = city;
      }
      return { success: true };
    },
    deleteCity: async (cityId: string) => {
      console.log('Deleting city:', cityId);
      // This would normally delete a city from the database
      // For now, we'll just simulate removing it from the local state
      const index = baseService.cities.findIndex((c: any) => c.id === cityId);
      if (index !== -1) {
        baseService.cities.splice(index, 1);
      }
      return { success: true };
    },
    getDistanceBetweenCities: async (originId: string, destinationId: string) => {
      console.log('Getting distance between cities:', originId, destinationId);
      // This would normally calculate or look up the distance between cities
      // For now, we'll just return a random value
      return {
        distance: Math.floor(Math.random() * 1000) + 50,
        duration: Math.floor(Math.random() * 600) + 30
      };
    },
    saveDistanceBetweenCities: async (data: any) => {
      console.log('Saving distance between cities:', data);
      // This would normally save the distance to the database
      return { success: true };
    }
  };
};
