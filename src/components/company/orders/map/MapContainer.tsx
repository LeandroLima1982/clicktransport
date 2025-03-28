
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import InteractiveMap from './InteractiveMap';
import StaticMap from './StaticMap';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { Button } from '@/components/ui/button';
import { Eye, Map } from 'lucide-react';
import { getMapboxDirections, getStaticMapUrl } from './mapUtils';

interface MapContainerProps {
  originAddress: string;
  destinationAddress: string;
  driverId?: string | null;
  orderId?: string | null;
  interactive?: boolean;
}

const MapContainer: React.FC<MapContainerProps> = ({
  originAddress,
  destinationAddress,
  driverId,
  orderId,
  interactive = false,
}) => {
  const [isInteractive, setIsInteractive] = useState(interactive);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staticMapUrl, setStaticMapUrl] = useState<string>('');
  const [routeData, setRouteData] = useState<any>(null);
  
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!originAddress || !destinationAddress) {
      setError("Endereços de origem e destino são necessários para mostrar o mapa");
      setIsLoading(false);
      return;
    }

    const loadMapData = async () => {
      try {
        setIsLoading(true);
        
        // Get static map URL regardless of mode
        const mapUrl = await getStaticMapUrl(originAddress, destinationAddress);
        setStaticMapUrl(mapUrl);
        
        // Get route data for interactive map
        if (isInteractive) {
          const route = await getMapboxDirections(originAddress, destinationAddress);
          setRouteData(route);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading map data:', err);
        setError('Não foi possível carregar o mapa. Verifique os endereços e tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMapData();
  }, [originAddress, destinationAddress, isInteractive]);

  const toggleMapMode = () => {
    setIsInteractive(prev => !prev);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleMapMode}
          className="flex items-center gap-2"
        >
          {isInteractive ? <Eye className="h-4 w-4" /> : <Map className="h-4 w-4" />}
          {isInteractive ? 'Ver Mapa Simples' : 'Ver Mapa Interativo'}
        </Button>
      </div>
      
      <div className="h-[300px] bg-slate-50 rounded-lg overflow-hidden border">
        {isInteractive ? (
          <InteractiveMap
            ref={mapContainerRef}
            mapRef={mapRef}
            originAddress={originAddress}
            destinationAddress={destinationAddress}
            routeData={routeData}
            driverId={driverId}
            orderId={orderId}
          />
        ) : (
          <StaticMap
            mapUrl={staticMapUrl}
            originAddress={originAddress}
            destinationAddress={destinationAddress}
          />
        )}
      </div>
    </div>
  );
};

export default MapContainer;
