
import React from 'react';

interface RouteInfoProps {
  distance: number;
  duration: number;
  isRealTimeData?: boolean;
}

const RouteInfo: React.FC<RouteInfoProps> = ({ 
  distance, 
  duration, 
  isRealTimeData = false 
}) => {
  // Format distance
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes} min`;
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-3 flex justify-between items-center">
      <div>
        <div className="flex items-center space-x-1">
          <span className="text-sm font-medium">Distância:</span>
          <span className="text-sm">{formatDistance(distance)}</span>
          {isRealTimeData && (
            <span className="inline-block h-2 w-2 bg-green-500 rounded-full ml-1 animate-pulse" 
                  title="Dados em tempo real" />
          )}
        </div>
      </div>
      <div>
        <div className="flex items-center space-x-1">
          <span className="text-sm font-medium">Tempo estimado:</span>
          <span className="text-sm">{formatDuration(duration)}</span>
          {isRealTimeData && (
            <span className="inline-block h-2 w-2 bg-green-500 rounded-full ml-1 animate-pulse"
                  title="Dados em tempo real" />
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteInfo;
