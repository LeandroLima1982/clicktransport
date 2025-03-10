
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapIcon, Loader2 } from 'lucide-react';
import InteractiveMap from './InteractiveMap';
import StaticMap from './StaticMap';
import RouteInfo from './RouteInfo';
import RouteTracker from './RouteTracker';

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
  useStaticMap,
  staticMapUrl,
  routeGeometry,
  routeDistance,
  routeDuration,
  originAddress = 'Origem',
  destinationAddress = 'Destino',
  onToggleMapType
}) => {
  // Check if the order is in a status that would have real-time tracking
  // In a real application, you would check the order status 
  // (e.g., 'in_progress' would have tracking)
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
        onToggleMapType={onToggleMapType}
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
          />
        )}
        
        {/* Route info overlay - show for both map types */}
        <RouteInfo distance={routeDistance} duration={routeDuration} />
      </div>
      
      <div className="flex justify-center gap-4">
        <Button onClick={onToggleMapType} variant="outline" className="gap-2">
          {useStaticMap ? (
            <>
              <MapIcon className="h-4 w-4" />
              Tentar mapa interativo
            </>
          ) : (
            <>
              <Loader2 className="h-4 w-4" />
              Recarregar mapa
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MapContainer;
