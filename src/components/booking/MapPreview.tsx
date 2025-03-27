
import React, { useEffect, useState } from 'react';
import { Loader2, MapPin, AlertTriangle } from 'lucide-react';
import { createStaticMapUrl } from '@/components/company/orders/map/mapUtils';
import { calculateRoute } from '@/utils/routeUtils';
import { fetchAddressSuggestions } from '@/utils/mapbox';
import { Button } from '@/components/ui/button';

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
  const [retryCount, setRetryCount] = useState(0);
  const [lastCalculatedOrigin, setLastCalculatedOrigin] = useState('');
  const [lastCalculatedDestination, setLastCalculatedDestination] = useState('');
  
  useEffect(() => {
    // Only calculate route if both origin and destination are provided and not empty
    if (!origin || !destination || origin.trim() === '' || destination.trim() === '') {
      return;
    }
    
    // Avoid calculating route if inputs are too short (likely incomplete)
    if (origin.length < 5 || destination.length < 5) {
      return;
    }
    
    // Prevent redundant calculations for the same addresses
    if (origin === lastCalculatedOrigin && destination === lastCalculatedDestination) {
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
      console.log('Calculating route between:', origin, destination);
      
      // Get coordinates for origin and destination
      const originResult = await fetchAddressSuggestions(origin);
      const destinationResult = await fetchAddressSuggestions(destination);
      
      if (!originResult?.length || !destinationResult?.length) {
        console.error('Address lookup failed:', { originResult, destinationResult });
        setError('Não foi possível encontrar os endereços especificados');
        setIsLoading(false);
        return;
      }
      
      // Get coordinates
      const originCenter = originResult[0].center;
      const destinationCenter = destinationResult[0].center;
      
      if (!originCenter || !destinationCenter) {
        console.error('Missing coordinates:', { originCenter, destinationCenter });
        setError('Endereços sem coordenadas válidas');
        setIsLoading(false);
        return;
      }
      
      console.log('Coordinates found:', { originCenter, destinationCenter });
      
      // Calculate route
      const routeInfo = await calculateRoute(
        `${originCenter[0]},${originCenter[1]}`,
        `${destinationCenter[0]},${destinationCenter[1]}`
      );
      
      if (!routeInfo) {
        console.error('Route calculation failed');
        setError('Não foi possível calcular a rota');
        setIsLoading(false);
        return;
      }
      
      console.log('Route calculated:', routeInfo);
      
      // Create static map URL with route visualization
      const mapUrl = createStaticMapUrl(
        [originCenter[0], originCenter[1]],
        [destinationCenter[0], destinationCenter[1]]
      );
      
      setStaticMapUrl(mapUrl);
      
      // Update state to prevent redundant calculations
      setLastCalculatedOrigin(origin);
      setLastCalculatedDestination(destination);
      
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
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    calculateAndDisplayRoute();
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
        <AlertTriangle className="h-8 w-8 text-amber-400 mb-2" />
        <div className="text-sm text-red-300 text-center">{error}</div>
        <div className="text-xs text-white/50 mt-2">Verifique se os endereços estão corretos</div>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3 text-xs border-amber-400/30 text-amber-300 hover:bg-amber-400/10"
          onClick={handleRetry}
        >
          Tentar novamente
        </Button>
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
    <div className="overflow-hidden rounded-lg border border-[#D4AF37]/20 shadow-lg relative group">
      <img 
        src={staticMapUrl} 
        alt="Mapa da rota" 
        className="w-full h-48 object-cover"
        onError={() => {
          setError('Falha ao carregar imagem do mapa');
          setStaticMapUrl(null);
        }}
      />
      
      {/* Overlay with retry button on hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <Button 
          size="sm" 
          className="bg-amber-400 hover:bg-amber-500 text-[#002366]"
          onClick={handleRetry}
        >
          Atualizar mapa
        </Button>
      </div>
    </div>
  );
};

export default MapPreview;
