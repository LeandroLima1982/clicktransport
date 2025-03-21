
import { loadGoogleMapsScript } from './loader';
import { isGoogleMapsLoaded } from './config';
import { calculateHaversineDistance, geocodeAddress } from './geocoding';
import { toast } from 'sonner';

// Calculate route between two addresses with detailed error handling
export const calculateRoute = async (
  origin: string,
  destination: string
): Promise<{
  distance: number; // in kilometers
  duration: number; // in minutes
  geometry?: any;
  source: 'google' | 'haversine' | 'fallback';
} | null> => {
  if (!origin || !destination) {
    console.error('Origem ou destino ausente');
    return null;
  }
  
  console.log(`Calculando rota de "${origin}" para "${destination}"`);
  
  try {
    // Tentativa #1: API Google Directions (melhor opção)
    await loadGoogleMapsScript();
    
    if (isGoogleMapsLoaded() && window.google?.maps?.DirectionsService) {
      try {
        console.log("Usando Google DirectionsService API");
        
        const originCoords = await geocodeAddress(origin);
        const destinationCoords = await geocodeAddress(destination);
        
        if (!originCoords || !destinationCoords) {
          console.warn('Geocodificação falhou, tentando método alternativo');
          throw new Error('Falha na geocodificação');
        }
        
        return new Promise((resolve) => {
          const directionsService = new window.google.maps.DirectionsService();
          directionsService.route({
            origin: originCoords,
            destination: destinationCoords,
            travelMode: window.google.maps.TravelMode.DRIVING
          }, (result, status) => {
            if (status !== window.google.maps.DirectionsStatus.OK || !result) {
              console.warn(`Falha na solicitação de direções: ${status}`);
              throw new Error(`DirectionsService falhou: ${status}`);
            }
            
            const route = result.routes[0];
            const leg = route.legs[0];
            
            // Extrair dados da rota
            console.log(`Distância calculada via Google: ${leg.distance?.value/1000} km, ${leg.duration?.value/60} min`);
            
            resolve({
              // Converter de metros para quilômetros
              distance: leg.distance ? leg.distance.value / 1000 : 0,
              // Converter de segundos para minutos
              duration: leg.duration ? Math.ceil(leg.duration.value / 60) : 0,
              // Para visualização de rota no mapa
              geometry: {
                type: 'LineString',
                coordinates: route.overview_path.map(point => [point.lng(), point.lat()])
              },
              source: 'google'
            });
          });
        }).catch(error => {
          console.error('Erro na API de Direções:', error);
          throw error; // Propagar para o próximo método
        });
      } catch (directionError) {
        console.warn(`Problemas com DirectionsService: ${directionError}. Tentando método haversine.`);
        // Continuar para próximo método
      }
    }
    
    // Tentativa #2: Cálculo Haversine baseado em coordenadas geográficas
    console.log("Tentando método haversine para cálculo da distância");
    const distance = await calculateHaversineDistance(origin, destination);
    
    if (distance > 0) {
      console.log(`Distância calculada via Haversine: ${distance} km`);
      return {
        distance,
        // Estimar duração baseada em velocidade média de 50 km/h
        duration: Math.ceil(distance * 60 / 50),
        source: 'haversine'
      };
    }
    
    // Tentativa #3: Fallback com valores estimados
    console.warn("Usando valores fallback");
    
    // Estimar uma distância razoável baseada no contexto urbano/interurbano
    let estimatedDistance = 15; // Padrão para viagens urbanas
    
    // Verificar se os endereços contêm cidades diferentes (indicando viagem mais longa)
    const originLower = origin.toLowerCase();
    const destinationLower = destination.toLowerCase();
    
    const majorCities = [
      'rio de janeiro', 'são paulo', 'belo horizonte', 'brasília', 'salvador', 
      'recife', 'fortaleza', 'curitiba', 'porto alegre', 'manaus'
    ];
    
    const originCity = majorCities.find(city => originLower.includes(city));
    const destinationCity = majorCities.find(city => destinationLower.includes(city));
    
    if (originCity && destinationCity && originCity !== destinationCity) {
      // Viagem entre cidades principais - estimar distância maior
      estimatedDistance = 100; 
    }
    
    return {
      distance: estimatedDistance,
      duration: Math.ceil(estimatedDistance * 60 / 50), // Ainda usando 50 km/h
      source: 'fallback'
    };
    
  } catch (error) {
    console.error('Erro ao calcular rota:', error);
    
    // Última opção de fallback
    return {
      distance: 15,
      duration: 30,
      source: 'fallback'
    };
  }
};
