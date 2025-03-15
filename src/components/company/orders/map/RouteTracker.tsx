
import React, { useEffect, useState } from 'react';
import { supabase } from '@/main';
import { Button } from '@/components/ui/button';
import { MapIcon, Loader2 } from 'lucide-react';
import InteractiveMap from './InteractiveMap';
import StaticMap from './StaticMap';
import RouteInfo from './RouteInfo';

interface RouteTrackerProps {
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
  onMapLoadFailure?: () => void;
  isLoading?: boolean;
}

interface DriverLocation {
  order_id: string;
  driver_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
  heading?: number;
  speed?: number;
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
  originAddress,
  destinationAddress,
  onToggleMapType,
  onMapLoadFailure,
  isLoading = false
}) => {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [remainingDistance, setRemainingDistance] = useState<number>(routeDistance);
  const [remainingDuration, setRemainingDuration] = useState<number>(routeDuration);
  const [heading, setHeading] = useState<number | undefined>(undefined);
  const [locationUpdateTime, setLocationUpdateTime] = useState<Date | null>(null);

  // Set up realtime subscription
  useEffect(() => {
    console.log(`Setting up realtime subscription for order ${orderId}`);
    
    const channel = supabase
      .channel('driver_locations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_locations',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          console.log('Received location update:', payload);
          const newLocation = payload.new as DriverLocation;
          
          if (newLocation) {
            // Update current location
            setCurrentLocation([newLocation.longitude, newLocation.latitude]);
            
            // Update heading if available
            if (newLocation.heading !== undefined) {
              setHeading(newLocation.heading);
            }
            
            // Update location timestamp
            setLocationUpdateTime(new Date());
            
            // Calculate remaining distance and duration
            // This is a simplified estimation - in a real app you might
            // want to call a directions API to get more accurate values
            if (destinationCoords && routeDistance && routeDuration) {
              // Calculate what percentage of the route is completed
              const totalDistance = calculateDistance(
                originCoords[1], originCoords[0],
                destinationCoords[1], destinationCoords[0]
              );
              
              const distanceFromStart = calculateDistance(
                originCoords[1], originCoords[0],
                newLocation.latitude, newLocation.longitude
              );
              
              const distanceToDestination = calculateDistance(
                newLocation.latitude, newLocation.longitude,
                destinationCoords[1], destinationCoords[0]
              );
              
              // Simple ratio calculation
              const progressRatio = distanceFromStart / totalDistance;
              const remainingRatio = distanceToDestination / totalDistance;
              
              // Update remaining values
              setRemainingDistance(routeDistance * remainingRatio);
              setRemainingDuration(routeDuration * remainingRatio);
            }
          }
        }
      )
      .subscribe();
    
    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, originCoords, destinationCoords, routeDistance, routeDuration]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };
  
  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  };

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="h-[500px] relative border rounded-md overflow-hidden bg-gray-100">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando mapa...</span>
          </div>
        ) : useStaticMap ? (
          <StaticMap url={staticMapUrl} />
        ) : (
          <InteractiveMap 
            originCoords={originCoords}
            destinationCoords={destinationCoords}
            routeGeometry={routeGeometry}
            originAddress={originAddress}
            destinationAddress={destinationAddress}
            currentLocation={currentLocation}
            heading={heading}
            onMapLoadFailure={onMapLoadFailure}
          />
        )}
        
        {!isLoading && (
          <RouteInfo 
            distance={remainingDistance || routeDistance} 
            duration={remainingDuration || routeDuration} 
            isRealTimeData={!!currentLocation}
            lastUpdate={locationUpdateTime}
          />
        )}
      </div>
      
      <div className="flex justify-center gap-4">
        <Button 
          onClick={onToggleMapType} 
          variant="outline"
          className="gap-2"
          disabled={isLoading}
        >
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

export default RouteTracker;
