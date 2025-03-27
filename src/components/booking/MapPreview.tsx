
import React, { useEffect, useState, useRef } from 'react';
import { Loader2, MapPin, AlertTriangle, Navigation, Clock, LocateFixed, DollarSign } from 'lucide-react';
import { 
  createStaticMapUrl, 
  fetchRouteData, 
  getEstimatedArrival, 
  formatAddress
} from '@/components/company/orders/map/mapUtils';
import { getCoordinatesFromAddress } from '@/components/company/orders/map/mapUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getVehicleRates } from '@/utils/routeUtils';

interface MapPreviewProps {
  origin: string;
  destination: string;
  selectedVehicleId?: string;
  onRouteCalculated?: (data: { distance: number; duration: number; fare: number }) => void;
}

const MapPreview: React.FC<MapPreviewProps> = ({ 
  origin, 
  destination,
  selectedVehicleId = 'sedan',
  onRouteCalculated
}) => {
  const [staticMapUrl, setStaticMapUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastCalculatedOrigin, setLastCalculatedOrigin] = useState('');
  const [lastCalculatedDestination, setLastCalculatedDestination] = useState('');
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
    arrivalTime: string;
    fareEstimate: number;
  } | null>(null);
  const [showingEstimates, setShowingEstimates] = useState(false);
  const [vehicleRates, setVehicleRates] = useState<any[]>([]);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load vehicle rates once when component mounts
  useEffect(() => {
    const loadVehicleRates = async () => {
      try {
        const rates = await getVehicleRates();
        setVehicleRates(rates);
      } catch (error) {
        console.error('Error loading vehicle rates:', error);
      }
    };
    
    loadVehicleRates();
  }, []);
  
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
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Add a small delay to prevent calculations while the user is still typing
    timeoutRef.current = setTimeout(() => {
      calculateAndDisplayRoute();
    }, 1000);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [origin, destination, selectedVehicleId]);
  
  const calculateFareEstimate = (distance: number, duration: number) => {
    // Get the selected vehicle rate from the loaded rates
    const selectedRate = vehicleRates.find(rate => rate.id === selectedVehicleId) || 
      { id: 'sedan', basePrice: 79.90, pricePerKm: 2.10 };
    
    // Apply the admin-defined rates
    const distancePrice = distance * selectedRate.pricePerKm;
    const totalPrice = selectedRate.basePrice + distancePrice;
    
    return parseFloat(totalPrice.toFixed(2));
  };
  
  const calculateAndDisplayRoute = async () => {
    if (!origin || !destination || origin.trim() === '' || destination.trim() === '') {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setShowingEstimates(false);
    
    try {
      console.log('Calculating route between:', origin, destination);
      
      // Get coordinates for origin and destination
      const originCoords = await getCoordinatesFromAddress(origin);
      const destinationCoords = await getCoordinatesFromAddress(destination);
      
      if (!originCoords || !destinationCoords) {
        console.error('Address lookup failed:', { originCoords, destinationCoords });
        setError('Não foi possível encontrar os endereços especificados');
        setIsLoading(false);
        return;
      }
      
      console.log('Coordinates found:', { originCoords, destinationCoords });
      
      // Calculate route
      const routeData = await fetchRouteData(originCoords, destinationCoords);
      
      if (!routeData) {
        console.error('Route calculation failed');
        setError('Não foi possível calcular a rota');
        setIsLoading(false);
        return;
      }
      
      console.log('Route calculated:', routeData);
      
      // Create static map URL with route visualization
      const mapUrl = createStaticMapUrl(originCoords, destinationCoords);
      setStaticMapUrl(mapUrl);
      
      // Calculate fare using admin-defined rates
      const fareEstimate = calculateFareEstimate(routeData.distance, routeData.duration);
      
      // Get estimated arrival time (Uber-like)
      const arrivalTime = getEstimatedArrival(routeData.duration);
      
      // Set route info
      setRouteInfo({
        distance: routeData.distance,
        duration: routeData.duration,
        arrivalTime,
        fareEstimate
      });
      
      // Show estimates after a small delay for UI effect (Uber-like)
      setTimeout(() => {
        setShowingEstimates(true);
      }, 300);
      
      // Update state to prevent redundant calculations
      setLastCalculatedOrigin(origin);
      setLastCalculatedDestination(destination);
      
      // Notify parent about route calculation
      if (onRouteCalculated) {
        onRouteCalculated({
          distance: routeData.distance,
          duration: routeData.duration,
          fare: fareEstimate
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
      <div className="flex flex-col items-center justify-center p-4 h-48 bg-white/5 rounded-lg border border-blue-200/30 shadow-md">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
        <div className="text-sm text-white/70">Calculando melhor rota...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 h-48 bg-white/5 rounded-lg border border-red-200/30 shadow-md">
        <AlertTriangle className="h-8 w-8 text-red-400 mb-2" />
        <div className="text-sm text-red-300 text-center">{error}</div>
        <div className="text-xs text-white/50 mt-2">Verifique se os endereços estão corretos</div>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3 text-xs border-blue-400/30 text-blue-300 hover:bg-blue-400/10"
          onClick={handleRetry}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }
  
  if (!staticMapUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-4 h-48 bg-white/5 rounded-lg border border-gray-200/30 shadow-md">
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
    <div className="overflow-hidden rounded-lg border border-blue-200/30 shadow-lg relative">
      {/* Map Image */}
      <div className="relative">
        <img 
          src={staticMapUrl} 
          alt="Mapa da rota" 
          className="w-full h-48 object-cover"
          onError={() => {
            setError('Falha ao carregar imagem do mapa');
            setStaticMapUrl(null);
          }}
        />
        
        {/* Origin & Destination badges (Uber-like) */}
        <div className="absolute top-2 left-2 right-2 flex flex-col gap-1">
          <Badge className="bg-blue-500/90 hover:bg-blue-500 text-white shadow-md text-xs py-1 flex items-center self-start">
            <Navigation className="h-3 w-3 mr-1" /> Origem
          </Badge>
          <Badge className="bg-black/80 hover:bg-black text-white shadow-md text-xs py-1 flex items-center self-end">
            <MapPin className="h-3 w-3 mr-1" /> Destino
          </Badge>
        </div>
        
        {/* Retry button */}
        <Button 
          size="icon" 
          variant="secondary"
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full shadow-md bg-white hover:bg-gray-100"
          onClick={handleRetry}
        >
          <LocateFixed className="h-4 w-4 text-blue-500" />
        </Button>
      </div>
      
      {/* Uber-like bottom info panel */}
      {routeInfo && (
        <div className={`
          bg-white p-3 transition-opacity duration-300 ease-in-out
          ${showingEstimates ? 'opacity-100' : 'opacity-0'}
        `}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-full mr-2">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  {routeInfo.duration} min
                </div>
                <div className="text-xs text-gray-500">
                  Chegada ~ {routeInfo.arrivalTime}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">
                {routeInfo.distance} km
              </div>
              <div className="text-xs font-semibold text-green-600 flex items-center justify-end">
                <DollarSign className="h-3 w-3 mr-1" />
                R$ {routeInfo.fareEstimate.toFixed(2).replace('.', ',')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPreview;
