
import React, { useEffect, useState } from 'react';
import { supabase } from '@/main';
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
  onToggleMapType
}) => {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [remainingDistance, setRemainingDistance] = useState<number>(routeDistance);
  const [remainingDuration, setRemainingDuration] = useState<number>(routeDuration);
  const [heading, setHeading] = useState<number | undefined>(undefined);

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
        {useStaticMap ? (
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
          />
        )}
        
        <RouteInfo 
          distance={remainingDistance || routeDistance} 
          duration={remainingDuration || routeDuration} 
          isRealTimeData={!!currentLocation}
        />
      </div>
      
      <div className="flex justify-center gap-4">
        <button 
          onClick={onToggleMapType} 
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          {useStaticMap ? (
            <>
              <span className="h-4 w-4" />
              Tentar mapa interativo
            </>
          ) : (
            <>
              <span className="h-4 w-4" />
              Recarregar mapa
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default RouteTracker;
