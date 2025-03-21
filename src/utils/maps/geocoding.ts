
import { loadGoogleMapsScript } from './loader';
import { isGoogleMapsLoaded } from './config';
import { toast } from 'sonner';

// Improved geocode function with better error handling
export const geocodeAddress = async (address: string): Promise<google.maps.LatLng | null> => {
  if (!address) {
    console.warn('Endereço vazio fornecido para geocodificação');
    return null;
  }
  
  console.log(`Geocodificando endereço: "${address}"`);
  
  try {
    await loadGoogleMapsScript();
    
    if (!isGoogleMapsLoaded() || !window.google?.maps?.Geocoder) {
      console.error('Google Maps Geocoder não está disponível');
      return null;
    }
    
    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { 
          address, 
          region: 'br',
          language: 'pt-BR'
        },
        (results, status) => {
          if (status !== window.google.maps.GeocoderStatus.OK || !results || results.length === 0) {
            console.error(`Falha na geocodificação: ${status} para "${address}"`);
            resolve(null);
            return;
          }
          
          console.log(`Geocodificação bem-sucedida para "${address}"`);
          resolve(results[0].geometry.location);
        }
      );
    });
  } catch (error) {
    console.error('Erro na geocodificação:', error);
    return null;
  }
};

// Calculate estimated distance between two addresses using haversine formula when API fails
export const calculateHaversineDistance = async (origin: string, destination: string): Promise<number> => {
  try {
    const originCoords = await geocodeAddress(origin);
    const destinationCoords = await geocodeAddress(destination);
    
    if (!originCoords || !destinationCoords) {
      console.warn('Coordenadas não disponíveis para cálculo de distância Haversine');
      return 0;
    }
    
    const lat1 = originCoords.lat();
    const lon1 = originCoords.lng();
    const lat2 = destinationCoords.lat();
    const lon2 = destinationCoords.lng();
    
    const R = 6371; // Raio da terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distância em km
    
    // Adicionar 40% para considerar as estradas vs linha reta
    const adjustedDistance = distance * 1.4;
    console.log(`Distância Haversine de "${origin}" para "${destination}": ${distance.toFixed(2)}km (ajustado: ${adjustedDistance.toFixed(2)}km)`);
    
    return adjustedDistance;
  } catch (error) {
    console.error('Erro ao calcular distância Haversine:', error);
    // Retornar um valor razoável se o cálculo falhar
    return 15;
  }
};
