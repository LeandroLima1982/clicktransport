
import React from 'react';
import { Clock, Navigation } from 'lucide-react';
import { formatDistance, formatDuration } from '../utils';

interface RouteInfoProps {
  distance: number;
  duration: number;
}

const RouteInfo: React.FC<RouteInfoProps> = ({ distance, duration }) => {
  if (distance <= 0 && duration <= 0) return null;
  
  return (
    <div className="absolute top-4 right-4 bg-white p-3 rounded-md shadow-md z-10 max-w-xs">
      <div className="flex flex-col space-y-2">
        <div className="text-sm font-semibold flex justify-between items-center">
          <span className="flex items-center">
            <Navigation className="h-4 w-4 mr-1" /> Distância:
          </span>
          <span>{formatDistance(distance)}</span>
        </div>
        <div className="text-sm font-semibold flex justify-between items-center">
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" /> Tempo estimado:
          </span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default RouteInfo;
