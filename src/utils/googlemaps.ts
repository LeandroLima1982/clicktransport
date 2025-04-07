
import React from 'react';
import { MapPin, Landmark, Home, Navigation, Building, ShoppingBag, School, Hospital, Hotel } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// A chave da API do Google será armazenada como uma variável de ambiente do Supabase
export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

// Verifica se o token é válido
if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.trim() === '') {
  console.error('Google Maps API key is missing or invalid - map functionality will not work!');
}

// Função para verificar se o texto é um CEP brasileiro válido
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
    
    // Construir um objeto adaptado para o formato esperado pelo app
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

// Função para buscar sugestões de endereços usando a API Google Places
export const fetchAddressSuggestions = async (query: string): Promise<any[]> => {
  if (query.length < 3) return [];
  
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.trim() === '') {
    console.error('Google Maps API key inválida. Verifique sua configuração.');
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
    
    // Normalizar consulta para endereços brasileiros
    const searchQuery = query + (query.toLowerCase().includes('brasil') ? '' : ' Brasil');

    // Usando a API de Places Autocomplete do Google
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(searchQuery)}&types=address&components=country:br&language=pt_BR&key=${GOOGLE_MAPS_API_KEY}`,
      { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status, data.error_message);
      return [];
    }
    
    console.log("Sugestões recebidas:", data.predictions?.length || 0);
    
    // Mapear o formato de resposta do Google para o formato esperado pelo aplicativo
    return (data.predictions || []).map((prediction: any, index: number) => {
      return {
        id: prediction.place_id,
        place_name: prediction.description,
        text: prediction.structured_formatting.main_text,
        place_type: ['address'],
        properties: {
          description: prediction.description
        },
        context: []
      };
    });
  } catch (error) {
    console.error('Erro ao buscar sugestões de endereço:', error);
    return [];
  }
};

// Obtém o ícone apropriado com base no tipo de lugar
export const getPlaceIcon = (place: any): React.ReactElement => {
  const placeType = typeof place === 'string' ? place : place.place_type?.[0];
  
  // Verificar tipos comuns
  if (placeType === 'poi') return React.createElement(Landmark, { className: "h-4 w-4 text-amber-500" });
  if (placeType === 'address') return React.createElement(Home, { className: "h-4 w-4 text-gray-500" });
  if (placeType === 'place') return React.createElement(Navigation, { className: "h-4 w-4 text-blue-500" });
  
  // Ícone padrão
  return React.createElement(MapPin, { className: "h-4 w-4 text-gray-500" });
};

// Geocodificar um endereço para coordenadas
export const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  if (!address || !GOOGLE_MAPS_API_KEY) return null;

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}&region=br`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Google Geocoding error:', data.status, data.error_message);
      return null;
    }
    
    const location = data.results[0].geometry.location;
    return [location.lng, location.lat]; // Retorne como [longitude, latitude] para manter compatibilidade
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

// Calcular rota entre dois pontos
export const calculateRouteWithGoogle = async (
  origin: [number, number], 
  destination: [number, number]
): Promise<{
  distance: number; // em km
  duration: number; // em minutos
  geometry: any;
} | null> => {
  if (!GOOGLE_MAPS_API_KEY) return null;

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin[1]},${origin[0]}&destination=${destination[1]},${destination[0]}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Directions API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
      console.error('Google Directions error:', data.status, data.error_message);
      return null;
    }
    
    const route = data.routes[0];
    const leg = route.legs[0];
    
    // Extrair informações da rota
    return {
      // Converter metros para quilômetros
      distance: leg.distance.value / 1000,
      // Converter segundos para minutos
      duration: Math.ceil(leg.duration.value / 60),
      // Codificar a geometria da rota (formato polyline)
      geometry: {
        coordinates: decodePolyline(route.overview_polyline.points),
        type: "LineString"
      }
    };
  } catch (error) {
    console.error('Error getting route:', error);
    return null;
  }
};

// Função para decodificar a polyline do Google em formato GeoJSON
function decodePolyline(encoded: string) {
  const points = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    // Note: Os pontos são armazenados como [longitude, latitude] para compatibilidade com GeoJSON
    points.push([lng * 1e-5, lat * 1e-5]);
  }
  return points;
}
