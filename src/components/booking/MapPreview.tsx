
import React, { useEffect, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { createStaticMapUrl } from '@/components/company/orders/map/mapUtils';
import { calculateRoute } from '@/utils/routeUtils';
import { fetchAddressSuggestions } from '@/utils/mapbox';

interface MapPreviewProps {
  origin: string;
  destination: string;
  onRouteCalculated?: (data: { distance: number; duration: number }) => void;
}

const MapPreview: React.FC<MapPreviewProps> = ({ 
  origin, 
  destination,
  onRouteCalculated
}) => {
  const [staticMapUrl, setStaticMapUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Only calculate route if both origin and destination are provided and not empty
    if (!origin || !destination || origin.trim() === '' || destination.trim() === '') {
      return;
    }
    
    // Avoid calculating route if inputs are too short (likely incomplete)
    if (origin.length < 5 || destination.length < 5) {
      return;
    }
    
    // Add a small delay to prevent calculations while the user is still typing
    const calculationTimer = setTimeout(() => {
      calculateAndDisplayRoute();
    }, 1000);
    
    return () => clearTimeout(calculationTimer);
  }, [origin, destination]);
  
  const calculateAndDisplayRoute = async () => {
    if (!origin || !destination || origin.trim() === '' || destination.trim() === '') {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get coordinates for origin and destination
      const originResult = await fetchAddressSuggestions(origin);
      const destinationResult = await fetchAddressSuggestions(destination);
      
      if (!originResult?.length || !destinationResult?.length) {
        setError('Não foi possível encontrar os endereços');
        setIsLoading(false);
        return;
      }
      
      // Get coordinates
      const originCenter = originResult[0].center;
      const destinationCenter = destinationResult[0].center;
      
      if (!originCenter || !destinationCenter) {
        setError('Endereços sem coordenadas válidas');
        setIsLoading(false);
        return;
      }
      
      // Calculate route
      const routeInfo = await calculateRoute(
        `${originCenter[0]},${originCenter[1]}`,
        `${destinationCenter[0]},${destinationCenter[1]}`
      );
      
      if (!routeInfo) {
        setError('Não foi possível calcular a rota');
        setIsLoading(false);
        return;
      }
      
      // Create static map URL
      const mapUrl = createStaticMapUrl(
        [originCenter[0], originCenter[1]],
        [destinationCenter[0], destinationCenter[1]]
      );
      
      setStaticMapUrl(mapUrl);
      
      // Notify parent about route calculation
      if (onRouteCalculated) {
        onRouteCalculated({
          distance: routeInfo.distance,
          duration: routeInfo.duration
        });
      }
    } catch (err) {
      console.error('Error calculating route:', err);
      setError('Ocorreu um erro ao calcular a rota');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 h-48 bg-white/5 rounded-lg border border-[#D4AF37]/20">
        <Loader2 className="h-8 w-8 animate-spin text-[#F8D748] mb-2" />
        <div className="text-sm text-white/70">Calculando rota...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 h-48 bg-white/5 rounded-lg border border-[#D4AF37]/20">
        <div className="text-sm text-red-300 text-center">{error}</div>
        <div className="text-xs text-white/50 mt-2">Verifique se os endereços estão corretos</div>
      </div>
    );
  }
  
  if (!staticMapUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-4 h-48 bg-white/5 rounded-lg border border-[#D4AF37]/20">
        <MapPin className="h-8 w-8 text-white/30 mb-2" />
        <div className="text-sm text-white/70 text-center">
          {(!origin || !destination) 
            ? "Informe os endereços de origem e destino para visualizar a rota" 
            : "Aguardando endereços completos..."}
        </div>
      </div>
    );
  }
  
  return (
    <div className="overflow-hidden rounded-lg border border-[#D4AF37]/20 shadow-lg">
      <img 
        src={staticMapUrl} 
        alt="Mapa da rota" 
        className="w-full h-48 object-cover"
      />
    </div>
  );
};

export default MapPreview;
