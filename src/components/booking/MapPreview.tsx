
import React, { useEffect, useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { calculateRoute, RouteInfo } from '@/utils/routeUtils';

interface MapPreviewProps {
  origin: string;
  destination: string;
  onRouteCalculated?: (routeData: { distance: number; duration: number }) => void;
  showMap?: boolean;
  shouldCalculate?: boolean; // New prop to control when to calculate
}

const MapPreview: React.FC<MapPreviewProps> = ({ 
  origin, 
  destination,
  onRouteCalculated,
  showMap = true,
  shouldCalculate = false // Default to false to prevent auto-calculation
}) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [routeData, setRouteData] = useState<RouteInfo | null>(null);
  
  const hasRequiredData = useMemo(() => {
    return origin && destination && origin.length > 5 && destination.length > 5 && shouldCalculate;
  }, [origin, destination, shouldCalculate]);
  
  useEffect(() => {
    if (hasRequiredData) {
      fetchRouteData();
    } else {
      // Reset when inputs are cleared
      setMapUrl(null);
      setRouteData(null);
    }
  }, [hasRequiredData, origin, destination]);

  const fetchRouteData = async () => {
    if (!hasRequiredData) return;
    
    setIsCalculating(true);
    setError(null);
    
    try {
      console.log('Calculating route between:', origin, destination);
      const routeInfo = await calculateRoute(origin, destination);
      
      if (!routeInfo) {
        console.error("Failed to calculate route");
        setError("Não foi possível calcular a rota.");
        return;
      }
      
      setRouteData(routeInfo);
      
      // Create Mapbox static image URL
      const mapboxToken = 'pk.eyJ1IjoiaW50ZWdyYXRpb25zIiwiYSI6ImNsZXhyYTB3bDBzZHQzeG82ZW04Z2lzdHIifQ.Gn1IoGg-zRmgmZxNWLdMHw';
      
      if (routeInfo.start_location && routeInfo.end_location) {
        const startCoords = `${routeInfo.start_location.lng},${routeInfo.start_location.lat}`;
        const endCoords = `${routeInfo.end_location.lng},${routeInfo.end_location.lat}`;
        
        // Create a static image with the route
        const markers = `pin-s-a+4A89F3(${startCoords}),pin-s-b+EB4C36(${endCoords})`;
        const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/auto/500x300@2x?padding=50&markers=${markers}&access_token=${mapboxToken}`;
        
        setMapUrl(url);
        
        // Pass route data to parent component
        if (onRouteCalculated) {
          onRouteCalculated({
            distance: routeInfo.distance,
            duration: routeInfo.duration
          });
        }
      }
    } catch (err) {
      console.error("Erro ao calcular rota:", err);
      setError("Erro ao calcular a rota.");
    } finally {
      setIsCalculating(false);
    }
  };

  if (!showMap) return null;

  if (isCalculating) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
        <div className="text-sm text-gray-500">Calculando rota...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 text-red-500 text-sm p-4">
        {error}
      </div>
    );
  }

  if (!mapUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 text-gray-500 text-sm">
        Aguardando origem e destino...
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      <img 
        src={mapUrl} 
        alt="Mapa da rota" 
        className="w-full h-full object-cover"
        onError={() => setError("Não foi possível carregar o mapa.")}
      />
      {routeData && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs flex justify-around">
          <div>Distância: {routeData.distance} km</div>
          <div>Tempo estimado: {Math.floor(routeData.duration / 60)}h {routeData.duration % 60}min</div>
        </div>
      )}
    </div>
  );
};

export default MapPreview;
