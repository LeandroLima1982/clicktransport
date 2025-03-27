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

// Correção: Ajuste nos parâmetros para funcionamento correto da API Mapbox
export const buildMapboxParams = (query: string) => {
  return {
    access_token: MAPBOX_TOKEN,
    country: 'br',
    language: 'pt-BR',
    limit: '8',
    types: POI_TYPES,
    autocomplete: true,
    fuzzyMatch: true,
    proximity: '-43.1729,-22.9068', // Rio de Janeiro como centro padrão
  };
};

// Verifica se o texto é um CEP brasileiro válido
export const isBrazilianCEP = (text: string): boolean => {
  // Remover qualquer caractere que não seja número
  const numbersOnly = text.replace(/\D/g, '');
  
  // CEP brasileiro deve ter 8 dígitos
  return /^\d{8}$/.test(numbersOnly);
};

// Formatar CEP com hífen para exibição
export const formatCEP = (cep: string): string => {
  // Remover qualquer caractere que não seja número
  const numbersOnly = cep.replace(/\D/g, '');
  
  // Retornar no formato xxxxx-xxx
  if (numbersOnly.length === 8) {
    return `${numbersOnly.substring(0, 5)}-${numbersOnly.substring(5)}`;
  }
  
  return numbersOnly;
};

// Função para buscar endereço pelo CEP usando a API ViaCEP
export const fetchAddressByCEP = async (cep: string): Promise<any | null> => {
  try {
    // Remover caracteres não numéricos
    const cepNumbers = cep.replace(/\D/g, '');
    
    if (cepNumbers.length !== 8) {
      console.warn('CEP inválido para consulta:', cep);
      return null;
    }
    
    console.log("Buscando endereço pelo CEP:", cepNumbers);
    
    const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);
    if (!response.ok) {
      console.error('Erro na API ViaCEP:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    // Verificar se retornou erro
    if (data.erro) {
      console.warn('CEP não encontrado:', cep);
      return null;
    }
    
    console.log("Dados do CEP recebidos:", data);
    
    // Construir um objeto no formato esperado pelo app
    const addressResult = {
      place_name: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}, ${cepNumbers}`,
      text: data.logradouro,
      place_type: ['address'],
      id: `cep-${cepNumbers}`,
      context: [
        { id: 'neighborhood', text: data.bairro },
        { id: 'place', text: data.localidade },
        { id: 'region', text: data.uf },
        { id: 'country', text: 'Brasil' }
      ],
      properties: {
        address: data.logradouro,
        cep: cepNumbers
      }
    };
    
    return addressResult;
  } catch (error) {
    console.error('Erro ao consultar CEP:', error);
    return null;
  }
};

// Detecta padrões comuns em endereços brasileiros completos
export const parseAndNormalizeBrazilianAddress = (address: string): string => {
  let normalized = address.trim();
  
  // Melhora a busca em casos específicos do Brasil
  if (!/\d+/.test(normalized) && /rua|avenida|av\.|av|alameda|travessa|estrada|rodovia/i.test(normalized)) {
    normalized += ' número';
  }
  
  // Adiciona termos de busca para melhorar precisão se não houver cidade/estado
  if (!/(brasil|brazil)/i.test(normalized) && 
      !/([A-Z]{2}|Acre|Alagoas|Amapá|Amazonas|Bahia|Ceará|Distrito Federal|Espírito Santo|Goiás|Maranhão|Mato Grosso|Mato Grosso do Sul|Minas Gerais|Pará|Paraíba|Paraná|Pernambuco|Piauí|Rio de Janeiro|Rio Grande do Norte|Rio Grande do Sul|Rondônia|Roraima|Santa Catarina|São Paulo|Sergipe|Tocantins)/i.test(normalized)) {
    normalized += ' Brasil';
  }
  
  return normalized;
};

// Função melhorada para buscar sugestões de endereços do Mapbox API
export const fetchAddressSuggestions = async (query: string): Promise<any[]> => {
  if (query.length < 3) return [];
  
  if (!isValidMapboxToken(MAPBOX_TOKEN)) {
    console.error('Token Mapbox inválido. Verifique sua configuração.');
    return [];
  }
  
  try {
    console.log("Buscando sugestões de endereço para:", query);
    
    // Verificar se é um CEP
    if (isBrazilianCEP(query)) {
      const cepResult = await fetchAddressByCEP(query);
      if (cepResult) {
        return [cepResult];
      }
    }
    
    // Adiciona termos que melhoram a busca para endereços brasileiros
    let searchQuery = parseAndNormalizeBrazilianAddress(query);
    
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json`;
    
    // Construir parâmetros da consulta como URLSearchParams
    const params = new URLSearchParams();
    const mapboxParams = buildMapboxParams(query);
    
    // Adicionar cada parâmetro à URLSearchParams
    Object.entries(mapboxParams).forEach(([key, value]) => {
      params.append(key, value.toString());
    });
    
    console.log("URL de consulta Mapbox:", `${endpoint}?${params.toString()}`);
    
    const response = await fetch(`${endpoint}?${params.toString()}`);
    if (!response.ok) {
      console.error(`Erro na API Mapbox: ${response.status}`, await response.text());
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

// NEW FUNCTIONS NEEDED BY LocationField.tsx:

// Detect address format from input (CEP, street, etc.) like Uber does
export const detectAddressFormat = (input: string): 'cep' | 'street' | 'poi' | 'unknown' => {
  // Check for Brazilian CEP format
  const cepRegex = /^(\d{5})-?(\d{3})$/;
  if (cepRegex.test(input.replace(/\D/g, ''))) {
    return 'cep';
  }
  
  // Check if input is likely a street address (contains street indicators)
  const streetIndicators = ['rua', 'r.', 'avenida', 'av.', 'av', 'alameda', 'al.', 'travessa', 'rodovia', 'estrada'];
  if (streetIndicators.some(indicator => input.toLowerCase().includes(indicator))) {
    return 'street';
  }
  
  // Check if input might be a point of interest
  const poiIndicators = ['shopping', 'restaurante', 'hotel', 'aeroporto', 'terminal', 'praça', 'parque', 'supermercado'];
  if (poiIndicators.some(indicator => input.toLowerCase().includes(indicator))) {
    return 'poi';
  }
  
  return 'unknown';
};

// Generate autofill suggestions based on partial input (Uber-like)
export const getAddressAutofill = async (
  partialInput: string,
  proximity?: [number, number]
): Promise<Array<{ description: string; placeId: string; }>> => {
  if (!MAPBOX_TOKEN || partialInput.length < 3) return [];
  
  try {
    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(partialInput)}.json?` +
      `access_token=${MAPBOX_TOKEN}&country=br&language=pt-BR&` + 
      `autocomplete=true&types=address,poi,place,neighborhood&limit=5`;
    
    // Add proximity if available to prioritize nearby results (like Uber)
    if (proximity) {
      url += `&proximity=${proximity[0]},${proximity[1]}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Autofill API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return [];
    }
    
    // Format suggestions in a clean, Uber-like way
    return data.features.map((feature: any) => ({
      description: feature.place_name,
      placeId: feature.id,
      // Add more properties from the feature if needed
    }));
  } catch (error) {
    console.error('Error getting address autofill:', error);
    return [];
  }
};

// Function to get current user location with high accuracy (Uber-like)
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      position => {
        console.log('Got user position:', position.coords);
        resolve(position);
      },
      error => {
        console.error('Error getting position:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

// Reverse geocode coordinates to address (Uber-like)
export const reverseGeocode = async (coords: [number, number]): Promise<string | null> => {
  if (!MAPBOX_TOKEN) return null;
  
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?` +
      `access_token=${MAPBOX_TOKEN}&language=pt-BR&types=address,place,neighborhood,locality`
    );
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }
    
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};
