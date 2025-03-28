
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Map, Activity } from 'lucide-react';
import InteractiveMap from './InteractiveMap';
import StaticMap from './StaticMap';
import RouteInfo from './RouteInfo';
import LiveDriverTracker from './LiveDriverTracker';
import { supabase } from '@/integrations/supabase/client';

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
  onToggleMapType?: () => void;
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
  originAddress,
  destinationAddress,
  onToggleMapType
}) => {
  const [activeTab, setActiveTab] = useState('map');
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);
  const [driverHeading, setDriverHeading] = useState<number | undefined>(undefined);
  const [eta, setEta] = useState<number | null>(null);
  const [isInProgress, setIsInProgress] = useState(false);

  // Check if the order is in progress
  useEffect(() => {
    const checkOrderStatus = async () => {
      const { data, error } = await supabase
        .from('service_orders')
        .select('status')
        .eq('id', orderId)
        .single();
        
      if (!error && data) {
        setIsInProgress(data.status === 'in_progress');
      }
    };
    
    checkOrderStatus();
    
    // Subscribe to order status changes
    const channel = supabase
      .channel(`order_status_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'service_orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          if (payload.new && payload.new.status) {
            setIsInProgress(payload.new.status === 'in_progress');
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Handler for driver location updates
  const handleLocationUpdate = (coords: [number, number], heading?: number) => {
    setDriverLocation(coords);
    setDriverHeading(heading);
  };
  
  // Handler for ETA updates
  const handleEtaUpdate = (etaSeconds: number) => {
    setEta(etaSeconds);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <Tabs defaultValue="map" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="map" className="flex items-center gap-1">
              <Map className="h-4 w-4" />
              <span>Mapa</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span>Informações</span>
            </TabsTrigger>
          </TabsList>

          {activeTab === 'map' && (
            <Button variant="outline" size="sm" onClick={onToggleMapType}>
              {useStaticMap ? 'Mapa Interativo' : 'Mapa Estático'}
            </Button>
          )}
        </div>

        <TabsContent value="map" className="flex-1 mt-2 h-[400px]">
          {useStaticMap ? (
            <StaticMap
              staticMapUrl={staticMapUrl}
              originAddress={originAddress}
              destinationAddress={destinationAddress}
            />
          ) : (
            <InteractiveMap
              originCoords={originCoords}
              destinationCoords={destinationCoords}
              routeGeometry={routeGeometry}
              originAddress={originAddress}
              destinationAddress={destinationAddress}
              currentLocation={driverLocation}
              heading={driverHeading}
            />
          )}
        </TabsContent>

        <TabsContent value="info" className="mt-2">
          <div className="space-y-4">
            <RouteInfo
              distance={routeDistance}
              duration={routeDuration}
              originAddress={originAddress}
              destinationAddress={destinationAddress}
              eta={eta}
            />
            
            {isInProgress && (
              <LiveDriverTracker 
                orderId={orderId}
                onLocationUpdate={handleLocationUpdate}
                onEtaUpdate={handleEtaUpdate}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MapContainer;
