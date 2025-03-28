
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
import LiveDriverTracker from './LiveDriverTracker';

export interface MapContainerProps {
  originAddress: string;
  destinationAddress: string;
  originCoords?: [number, number];
  destinationCoords?: [number, number];
  driverId?: string | null;
  orderId?: string | null;
  interactive?: boolean;
  useStaticMap?: boolean;
  staticMapUrl?: string | null;
  routeGeometry?: any;
  routeDistance?: number;
  routeDuration?: number;
  onToggleMapType?: () => void;
}

const MapContainer: React.FC<MapContainerProps> = ({
  originAddress,
  destinationAddress,
  originCoords,
  destinationCoords,
  driverId,
  orderId,
  interactive = false,
  useStaticMap,
  staticMapUrl: externalStaticMapUrl,
  routeGeometry: externalRouteGeometry,
  routeDistance: externalRouteDistance,
  routeDuration: externalRouteDuration,
  onToggleMapType,
}) => {
  const [isInteractive, setIsInteractive] = useState(interactive);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staticMapUrl, setStaticMapUrl] = useState<string>('');
  const [routeData, setRouteData] = useState<any>(null);
  const [parsedOriginCoords, setParsedOriginCoords] = useState<[number, number] | null>(null);
  const [parsedDestinationCoords, setParsedDestinationCoords] = useState<[number, number] | null>(null);
  
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // If external props for static mode are provided, use those instead
  useEffect(() => {
    if (useStaticMap !== undefined) {
      setIsInteractive(!useStaticMap);
    }
  }, [useStaticMap]);

  useEffect(() => {
    if (externalStaticMapUrl) {
      setStaticMapUrl(externalStaticMapUrl);
    }
  }, [externalStaticMapUrl]);

  useEffect(() => {
    if (externalRouteGeometry) {
      setRouteData({
        geometry: externalRouteGeometry,
        distance: externalRouteDistance,
        duration: externalRouteDuration
      });
    }
  }, [externalRouteGeometry, externalRouteDistance, externalRouteDuration]);

  // Parse coordinates if they're provided as an array or get them from API
  useEffect(() => {
    // Set parsed coordinates if they're provided directly
    if (originCoords && Array.isArray(originCoords) && originCoords.length === 2) {
      setParsedOriginCoords(originCoords as [number, number]);
    }
    
    if (destinationCoords && Array.isArray(destinationCoords) && destinationCoords.length === 2) {
      setParsedDestinationCoords(destinationCoords as [number, number]);
    }
    
    // Skip API calls if coords and data are provided externally
    if ((parsedOriginCoords && parsedDestinationCoords) || externalRouteGeometry) {
      setIsLoading(false);
      return;
    }

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
        setStaticMapUrl(mapUrl || '');
        
        // Get route data for interactive map
        if (isInteractive) {
          const route = await getMapboxDirections(originAddress, destinationAddress);
          if (route) {
            setRouteData(route);
            
            // Get coordinates from the route if not provided directly
            if (!parsedOriginCoords || !parsedDestinationCoords) {
              const coords = route.geometry?.coordinates;
              if (coords && coords.length >= 2) {
                setParsedOriginCoords(coords[0] as [number, number]);
                setParsedDestinationCoords(coords[coords.length - 1] as [number, number]);
              }
            }
          }
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
  }, [originAddress, destinationAddress, isInteractive, originCoords, destinationCoords, externalRouteGeometry, parsedOriginCoords, parsedDestinationCoords]);

  const toggleMapMode = () => {
    if (onToggleMapType) {
      onToggleMapType();
    } else {
      setIsInteractive(prev => !prev);
    }
  };

  const handleRetry = () => {
    // Reload map data
    setIsLoading(true);
    setError(null);
    
    const loadMapData = async () => {
      try {
        const mapUrl = await getStaticMapUrl(originAddress, destinationAddress);
        setStaticMapUrl(mapUrl || '');
        
        if (isInteractive) {
          const route = await getMapboxDirections(originAddress, destinationAddress);
          if (route) {
            setRouteData(route);
            
            // Get coordinates from the route if not provided directly
            if (!parsedOriginCoords || !parsedDestinationCoords) {
              const coords = route.geometry?.coordinates;
              if (coords && coords.length >= 2) {
                setParsedOriginCoords(coords[0] as [number, number]);
                setParsedDestinationCoords(coords[coords.length - 1] as [number, number]);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error reloading map data:', err);
        setError('Não foi possível carregar o mapa. Verifique os endereços e tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMapData();
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />;
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
            originCoords={parsedOriginCoords || [0, 0]}
            destinationCoords={parsedDestinationCoords || [0, 0]}
            routeGeometry={routeData?.geometry || externalRouteGeometry}
            originAddress={originAddress}
            destinationAddress={destinationAddress}
            onMapLoadFailure={() => setIsInteractive(false)}
          />
        ) : (
          <StaticMap
            mapUrl={staticMapUrl}
            originAddress={originAddress}
            destinationAddress={destinationAddress}
          />
        )}
      </div>
      
      {driverId && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Localização do motorista</h3>
          <LiveDriverTracker 
            driverId={driverId}
            map={null}
            markerId={`driver-${driverId}`}
          />
        </div>
      )}
    </div>
  );
};

export default MapContainer;
