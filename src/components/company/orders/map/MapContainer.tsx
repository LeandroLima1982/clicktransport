
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapIcon, Loader2 } from 'lucide-react';
import InteractiveMap from './InteractiveMap';
import StaticMap from './StaticMap';
import RouteInfo from './RouteInfo';
import RouteTracker from './RouteTracker';
import { canUseInteractiveMaps } from './mapUtils';
import { toast } from 'sonner';

interface MapContainerProps {
  orderId: string;
  originCoords: [number, number];
  destinationCoords: [number, number];
  useStaticMap: boolean;
  staticMapUrl: string | null;
  routeGeometry: any;
  routeDistance: number;
  routeDuration: number;
  originAddress?: string;
  destinationAddress?: string;
  onToggleMapType: () => void;
}

const MapContainer: React.FC<MapContainerProps> = ({
  orderId,
  originCoords,
  destinationCoords,
  useStaticMap: initialUseStaticMap,
  staticMapUrl,
  routeGeometry,
  routeDistance,
  routeDuration,
  originAddress = 'Origem',
  destinationAddress = 'Destino',
  onToggleMapType
}) => {
  // Internal state to track map type, initialized with the prop but can change based on WebGL detection
  const [useStaticMap, setUseStaticMap] = useState(initialUseStaticMap);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);

  // Check WebGL support on component mount
  useEffect(() => {
    // Only try to auto-detect if we're supposed to use the interactive map
    if (!initialUseStaticMap) {
      const canUseInteractive = canUseInteractiveMaps();
      
      if (!canUseInteractive && !useStaticMap) {
        console.log('WebGL or performance issue detected, switching to static map');
        setUseStaticMap(true);
        toast.info('Mapa estático carregado para melhor performance');
      }
    }
  }, [initialUseStaticMap]);

  // Handle map load failures
  const handleMapLoadFailure = () => {
    console.log('Interactive map failed to load, falling back to static map');
    setMapLoadFailed(true);
    setUseStaticMap(true);
    toast.error('Falha ao carregar mapa interativo, usando mapa estático');
  };

  // Handle toggle map type with error handling
  const handleToggleMapType = () => {
    if (useStaticMap) {
      // Switching from static to interactive
      setUseStaticMap(false);
    } else {
      // Switching from interactive to static
      setUseStaticMap(true);
    }
    
    // Also call the parent's toggle function
    onToggleMapType();
  };

  // Check if the order is in a status that would have real-time tracking
  const hasRealTimeTracking = true;

  if (hasRealTimeTracking) {
    return (
      <RouteTracker
        orderId={orderId}
        originCoords={originCoords}
        destinationCoords={destinationCoords}
        useStaticMap={useStaticMap}
        staticMapUrl={staticMapUrl}
        routeGeometry={routeGeometry}
        routeDistance={routeDistance}
        routeDuration={routeDuration}
        originAddress={originAddress}
        destinationAddress={destinationAddress}
        onToggleMapType={handleToggleMapType}
        onMapLoadFailure={handleMapLoadFailure}
      />
    );
  }

  // Fallback to regular map display without tracking
  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="h-[500px] relative border rounded-md overflow-hidden bg-gray-100">
        {useStaticMap ? (
          /* Static map fallback */
          <StaticMap url={staticMapUrl} />
        ) : (
          /* Interactive map */
          <InteractiveMap 
            originCoords={originCoords}
            destinationCoords={destinationCoords}
            routeGeometry={routeGeometry}
            originAddress={originAddress}
            destinationAddress={destinationAddress}
            onMapLoadFailure={handleMapLoadFailure}
          />
        )}
        
        {/* Route info overlay - show for both map types */}
        <RouteInfo distance={routeDistance} duration={routeDuration} />
      </div>
      
      <div className="flex justify-center gap-4">
        <Button onClick={handleToggleMapType} variant="outline" className="gap-2">
          {useStaticMap ? (
            <>
              <MapIcon className="h-4 w-4" />
              Tentar mapa interativo
            </>
          ) : (
            <>
              <Loader2 className="h-4 w-4" />
              Usar mapa estático
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MapContainer;
