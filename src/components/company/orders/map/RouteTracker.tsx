import React from 'react';
import { MapboxMap } from './mapUtils';
import { Button } from '@/components/ui/button';
import { Layers } from 'lucide-react';

export interface RouteTrackerProps {
  orderId: string;
  originCoords: [number, number];
  destinationCoords: [number, number];
  useStaticMap: boolean;
  staticMapUrl: string;
  routeGeometry: any;
  routeDistance: number;
  routeDuration: number;
  mapInstance?: MapboxMap;
  isLoading: boolean;
  onToggleMapType?: () => void;
}

const RouteTracker: React.FC<RouteTrackerProps> = ({
  orderId,
  originCoords,
  destinationCoords,
  useStaticMap,
  staticMapUrl,
  routeGeometry,
  routeDistance,
  routeDuration,
  mapInstance,
  isLoading,
  onToggleMapType,
}) => {
  // Format distance and duration for display
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters.toFixed(0)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
        <p className="text-gray-500">Carregando rota...</p>
      </div>
    );
  }

  if (useStaticMap) {
    return (
      <div className="relative">
        <img 
          src={staticMapUrl} 
          alt="Mapa da rota" 
          className="w-full h-64 object-cover rounded-md"
        />
        {onToggleMapType && (
          <Button
            onClick={onToggleMapType}
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 z-10"
          >
            <Layers className="h-4 w-4 mr-1" />
            Interativo
          </Button>
        )}
        <div className="mt-2 flex justify-between text-sm text-gray-600">
          <span>Distância: {formatDistance(routeDistance)}</span>
          <span>Tempo estimado: {formatDuration(routeDuration)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div id={`map-${orderId}`} className="w-full h-64 rounded-md"></div>
      {onToggleMapType && (
        <Button
          onClick={onToggleMapType}
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 z-10"
        >
          <Layers className="h-4 w-4 mr-1" />
          Estático
        </Button>
      )}
      <div className="mt-2 flex justify-between text-sm text-gray-600">
        <span>Distância: {formatDistance(routeDistance)}</span>
        <span>Tempo estimado: {formatDuration(routeDuration)}</span>
      </div>
    </div>
  );
};

export default RouteTracker;
