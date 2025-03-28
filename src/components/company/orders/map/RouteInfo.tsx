
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatTravelTime } from '@/utils/routeUtils';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

interface RouteInfoProps {
  distance: number;
  duration: number;
  originAddress?: string;
  destinationAddress?: string;
  eta?: number | null;
}

const RouteInfo: React.FC<RouteInfoProps> = ({
  distance,
  duration,
  originAddress = 'Origem',
  destinationAddress = 'Destino',
  eta
}) => {
  // Format distance for display
  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  };
  
  // Format ETA for display
  const formatEta = () => {
    if (!eta) return null;
    
    const minutes = Math.ceil(eta / 60);
    const etaTime = new Date();
    etaTime.setMinutes(etaTime.getMinutes() + minutes);
    
    return etaTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-green-600" /> 
            Origem
          </h3>
          <p className="text-sm text-muted-foreground ml-5">{originAddress}</p>
        </div>
        
        <div className="flex justify-center">
          <ArrowRight className="text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-red-600" /> 
            Destino
          </h3>
          <p className="text-sm text-muted-foreground ml-5">{destinationAddress}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
          <div className="space-y-1">
            <h4 className="text-xs text-muted-foreground">Distância</h4>
            <p className="font-medium">{formatDistance(distance)}</p>
          </div>
          
          <div className="space-y-1">
            <h4 className="text-xs text-muted-foreground">Tempo estimado</h4>
            <p className="font-medium">{formatTravelTime(duration)}</p>
          </div>
        </div>
        
        {eta && (
          <div className="pt-3 border-t">
            <div className="space-y-1">
              <h4 className="text-xs flex items-center">
                <Clock className="h-3 w-3 mr-1 text-primary" />
                Chegada prevista (tempo real)
              </h4>
              <p className="font-medium text-primary">{formatEta()}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteInfo;
