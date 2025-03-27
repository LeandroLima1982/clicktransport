
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { calculateRoute, RouteInfo } from '@/utils/routeUtils';

interface MapPreviewProps {
  origin: string;
  destination: string;
  onRouteCalculated?: (routeData: { distance: number; duration: number }) => void;
}

// Extended RouteInfo with success and route properties
interface RouteResult {
  success: boolean;
  route: {
    distance: number;
    duration: number;
    start_location: { lat: number; lng: number };
    end_location: { lat: number; lng: number };
    geometry: string;
  };
}

const MapPreview: React.FC<MapPreviewProps> = ({ 
  origin, 
  destination,
  onRouteCalculated
}) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (origin && destination) {
      fetchRouteData();
    }
  }, [origin, destination]);

  const fetchRouteData = async () => {
    setIsCalculating(true);
    setError(null);
    
    try {
      const routeInfo = await calculateRoute(origin, destination);
      
      if (!routeInfo) {
        setError("Não foi possível calcular a rota.");
        return;
      }
      
      // Convert RouteInfo to RouteResult format
      const result: RouteResult = {
        success: true,
        route: {
          distance: routeInfo.distance,
          duration: routeInfo.duration,
          start_location: { lat: 0, lng: 0 }, // Default values
          end_location: { lat: 0, lng: 0 }, // Default values
          geometry: routeInfo.geometry || ""
        }
      };
      
      // Extract coordinates from geometry or use defaults
      const startCoords = "0,0";
      const endCoords = "0,0";
      
      // Create Mapbox static image URL
      const mapboxToken = 'pk.eyJ1IjoiaW50ZWdyYXRpb25zIiwiYSI6ImNsZXhyYTB3bDBzZHQzeG82ZW04Z2lzdHIifQ.Gn1IoGg-zRmgmZxNWLdMHw';
      
      let url;
      if (result.route.geometry) {
        const path = `path-2+0077ff-0.5(${encodeURIComponent(result.route.geometry)})`;
        const markers = `pin-s-a+4A89F3(${startCoords}),pin-s-b+EB4C36(${endCoords})`;
        url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${path},${markers}/auto/500x300@2x?access_token=${mapboxToken}`;
      } else {
        // Fallback to a simple map centered on Brazil if no geometry is available
        url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-53.2,-14.4,3/500x300@2x?access_token=${mapboxToken}`;
      }
      
      setMapUrl(url);
      
      // Pass route data to parent component
      if (onRouteCalculated) {
        onRouteCalculated({
          distance: result.route.distance,
          duration: result.route.duration
        });
      }
    } catch (err) {
      console.error("Erro ao calcular rota:", err);
      setError("Erro ao calcular a rota.");
    } finally {
      setIsCalculating(false);
    }
  };

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
    </div>
  );
};

export default MapPreview;
