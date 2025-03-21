
import React from 'react';
import { Building, Landmark, Home, Navigation, MapPin, ShoppingBag, School, Hospital, Hotel, Coffee, Utensils, Bus, Plane, Music as MusicIcon, Dumbbell, Church, Library as LibraryBig, Trees } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Export the Mapbox token
export const MAPBOX_TOKEN = 'pk.eyJ1IjoibGVhbmRyb2xpbWExOTgyIiwiYSI6ImNtODA3MGxmaTB0dDAyanFia244dnl1bmcifQ.6iV8YcZ-x_gdi8uJWg5aCw';

// Check if token is valid
if (!MAPBOX_TOKEN || MAPBOX_TOKEN.trim() === '') {
  console.error('Mapbox token is missing or invalid - map functionality will not work!');
}

// POI types to include in the geocoding request - prioritizing important locations and addresses
export const POI_TYPES = 'address,poi.landmark,poi.airport,place,neighborhood,locality,district';

// Function type for getPlaceIcon
type IconComponent = React.ReactElement;

// Improved function for getting the appropriate icon based on place category
export const getPlaceIcon = (place: any): IconComponent => {
  const category = place.properties?.category;
  const placeType = place.place_type?.[0];
  
  // Check for specific categories - prioritizing important locations
  if (category === 'airport' || category?.includes('airport')) return React.createElement(Plane, { className: "h-4 w-4 text-blue-600" });
  if (category === 'hotel' || category?.includes('hotel') || category?.includes('lodging')) return React.createElement(Hotel, { className: "h-4 w-4 text-amber-600" });
  if (category?.includes('restaurant') || category?.includes('food')) return React.createElement(Utensils, { className: "h-4 w-4 text-red-600" });
  if (category?.includes('coffee') || category?.includes('cafe')) return React.createElement(Coffee, { className: "h-4 w-4 text-amber-700" });
  if (category?.includes('shopping') || category?.includes('store') || category?.includes('mall')) return React.createElement(ShoppingBag, { className: "h-4 w-4 text-purple-600" });
  if (category?.includes('school') || category?.includes('education') || category?.includes('university')) return React.createElement(School, { className: "h-4 w-4 text-blue-500" });
  if (category?.includes('hospital') || category?.includes('medical') || category?.includes('health')) return React.createElement(Hospital, { className: "h-4 w-4 text-red-500" });
  if (category?.includes('park') || category?.includes('garden') || category?.includes('recreation')) return React.createElement(Trees, { className: "h-4 w-4 text-green-600" });
  if (category?.includes('bus') || category?.includes('train') || category?.includes('transport')) return React.createElement(Bus, { className: "h-4 w-4 text-blue-500" });
  if (category?.includes('entertainment') || category?.includes('music') || category?.includes('theater')) return React.createElement(MusicIcon, { className: "h-4 w-4 text-purple-500" });
  if (category?.includes('sports') || category?.includes('gym') || category?.includes('fitness')) return React.createElement(Dumbbell, { className: "h-4 w-4 text-gray-600" });
  if (category?.includes('religious') || category?.includes('church') || category?.includes('temple')) return React.createElement(Church, { className: "h-4 w-4 text-gray-700" });
  if (category?.includes('library') || category?.includes('museum')) return React.createElement(LibraryBig, { className: "h-4 w-4 text-amber-800" });
  
  // Check for place types
  if (placeType === 'poi') return React.createElement(Landmark, { className: "h-4 w-4 text-amber-500" });
  if (placeType === 'address') return React.createElement(Home, { className: "h-4 w-4 text-gray-500" });
  if (placeType === 'place') return React.createElement(Navigation, { className: "h-4 w-4 text-blue-500" });
  if (placeType === 'neighborhood' || placeType === 'locality') return React.createElement(Navigation, { className: "h-4 w-4 text-green-500" });
  
  // Default icon
  return React.createElement(MapPin, { className: "h-4 w-4 text-gray-500" });
};

// Format place name with additional context and category information - improved for Brazilian addresses
export const formatPlaceName = (place: any): React.ReactElement => {
  const mainText = place.text;
  const category = place.properties?.category || '';
  const address = place.properties?.address || '';
  
  // Get context items for Brazilian address format
  const contextItems = place.context?.map((c: any) => c.text).filter(Boolean) || [];
  
  // Format Brazilian style address if possible
  let formattedAddress = '';
  let neighborhood = '';
  let city = '';
  let state = '';
  
  // Extract address components from context
  place.context?.forEach((ctx: any) => {
    if (ctx.id?.startsWith('neighborhood')) {
      neighborhood = ctx.text;
    } else if (ctx.id?.startsWith('place')) {
      city = ctx.text;
    } else if (ctx.id?.startsWith('region')) {
      state = ctx.text;
    }
  });
  
  // Build Brazilian address format
  if (city && state) {
    if (neighborhood) {
      formattedAddress = `${neighborhood}, ${city} - ${state}`;
    } else {
      formattedAddress = `${city} - ${state}`;
    }
  } else {
    formattedAddress = contextItems.join(', ');
  }
  
  // Build the component structure for place name display using React.createElement instead of JSX
  return React.createElement('div', {}, [
    React.createElement('div', { className: "font-medium", key: "main" }, mainText),
    category && React.createElement('div', { className: "text-xs font-medium text-primary/80", key: "category" }, category),
    address && React.createElement('div', { className: "text-xs text-gray-600", key: "address" }, address),
    formattedAddress && React.createElement('div', { className: "text-xs text-gray-600", key: "context" }, formattedAddress)
  ].filter(Boolean));
};

// Helper function to validate the Mapbox token
export const isValidMapboxToken = (token: string): boolean => {
  if (!token) return false;
  return token.length > 20 && 
         token.startsWith('pk.') && 
         !token.includes('YOUR_MAPBOX_TOKEN');
};

// Function to build parameters for Mapbox geocoding API - improved for Brazilian addresses
export const buildMapboxParams = (query: string) => {
  return new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    country: 'br',
    language: 'pt',
    limit: '8',
    types: POI_TYPES,
    autocomplete: 'true',
    fuzzyMatch: 'true',
    routing: 'true',  // Melhora busca de endereços para rotas
    worldview: 'br',  // Usa visão brasileira do mundo
    proximity: '-43.1729,-22.9068', // Rio de Janeiro como centro padrão
    bbox: '-73.9872354,-33.7683777,-34.7299934,5.24448639', // Brasil bounding box
  });
};

// Função melhorada para buscar sugestões de endereços do Mapbox API
export const fetchAddressSuggestions = async (query: string) => {
  if (query.length < 3) return [];
  
  if (!isValidMapboxToken(MAPBOX_TOKEN)) {
    console.error('Token Mapbox inválido. Verifique sua configuração.');
    return [];
  }
  
  try {
    console.log("Buscando sugestões de endereço para:", query);
    
    // Adiciona termos que melhoram a busca para endereços brasileiros
    let searchQuery = query;
    
    // Verifica se o endereço já tem número (padrão brasileiro: "rua x, 123")
    const hasNumber = /\d+/.test(query);
    
    // Se não tiver número e tiver "rua", "av", etc., adiciona um marcador para melhorar a precisão
    if (!hasNumber && /rua|avenida|av\.|av|alameda|travessa|estrada|rodovia/i.test(query)) {
      searchQuery += ' endereço'; 
    }
    
    // Adiciona país se não estiver especificado
    if (!query.toLowerCase().includes('brasil') && !query.toLowerCase().includes('brazil')) {
      searchQuery += ' Brasil';
    }
    
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json`;
    const params = buildMapboxParams(query);
    
    const response = await fetch(`${endpoint}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Erro na API Mapbox: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Sugestões recebidas:", data.features?.length || 0);
    
    // Ordena resultados para priorizar endereços específicos
    const features = data.features || [];
    
    return features.sort((a: any, b: any) => {
      // Ordem de prioridade: endereços específicos, pontos de interesse, outros
      const getTypeScore = (item: any) => {
        const placeType = item.place_type?.[0] || '';
        const placeName = item.place_name || '';
        
        // Prioriza endereços com números
        if (placeType === 'address' && /\d+/.test(placeName)) return 1;
        
        // Depois endereços sem números
        if (placeType === 'address') return 2;
        
        // Depois pontos de interesse
        if (placeType === 'poi') return 3;
        
        // Bairros e localidades 
        if (placeType === 'neighborhood' || placeType === 'locality') return 4;
        
        // Cidades
        if (placeType === 'place') return 5;
        
        return 6;
      };
      
      return getTypeScore(a) - getTypeScore(b);
    });
  } catch (error) {
    console.error('Erro ao buscar sugestões de endereço:', error);
    return [];
  }
};
