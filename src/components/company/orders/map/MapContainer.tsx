
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapIcon, Loader2 } from 'lucide-react';
import InteractiveMap from './InteractiveMap';
import StaticMap from './StaticMap';
import RouteInfo from './RouteInfo';

interface MapContainerProps {
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
