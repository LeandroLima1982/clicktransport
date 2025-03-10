
import React from 'react';
import { Clock, Navigation } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RouteInfoProps {
  distance: number;
  duration: number;
  isRealTimeData?: boolean;
  lastUpdate?: Date | null;
}

const RouteInfo: React.FC<RouteInfoProps> = ({ 
  distance, 
  duration, 
  isRealTimeData = false,
  lastUpdate = null 
}) => {
  // Format distance in km with 1 decimal place
  const formatDistanceText = (meters: number) => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };
  
  // Format duration in hours and minutes
  const formatDurationText = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes} min`;
    }
  };

  // Format last update time
  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Dados ao vivo não disponíveis';
    
    return formatDistance(date, new Date(), { 
      addSuffix: true,
      locale: ptBR
    });
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-background/90 p-2 rounded-t-md border-t backdrop-blur-sm">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center">
          <Navigation className="h-4 w-4 mr-1 text-primary" />
          <span className="text-sm font-medium">{formatDistanceText(distance)}</span>
        </div>
        
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1 text-primary" />
          <span className="text-sm font-medium">{formatDurationText(duration)}</span>
        </div>
        
        {isRealTimeData && (
          <div className="flex items-center">
            <span className="text-xs text-muted-foreground">
              Atualizado: {formatLastUpdate(lastUpdate)}
            </span>
            <div className={`ml-2 h-2 w-2 rounded-full ${lastUpdate && (new Date().getTime() - lastUpdate.getTime() < 5 * 60 * 1000) ? 'bg-green-500' : 'bg-amber-500'}`}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteInfo;
