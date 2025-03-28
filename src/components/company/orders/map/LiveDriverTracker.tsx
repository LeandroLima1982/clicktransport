import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Map, Marker } from 'mapbox-gl';
import { AlertTriangle, Clock, Navigation } from 'lucide-react';

interface LiveDriverTrackerProps {
  driverId: string;
  map: Map | null;
  markerId?: string;
}

interface DriverLocation {
  latitude: number;
  longitude: number;
  heading?: number | null;
  timestamp: string;
  eta_seconds?: number | null;
  [key: string]: any;
}

const LiveDriverTracker: React.FC<LiveDriverTrackerProps> = ({ driverId, map, markerId }) => {
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driverId) return;

    // Initial fetch
    fetchDriverLocation();

    // Set up realtime subscription
    const channel = supabase
      .channel(`driver_location_${driverId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_locations',
          filter: `driver_id=eq.${driverId}`
        },
        (payload) => {
          console.log('Driver location update:', payload);
          handleLocationUpdate(payload.new as DriverLocation);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId, map]);

  const fetchDriverLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('driver_locations')
        .select('*')
        .eq('driver_id', driverId)
        .single();

      if (error) {
        setError('Não foi possível obter a localização do motorista');
        return;
      }

      if (data) {
        handleLocationUpdate(data as DriverLocation);
      }
    } catch (err) {
      console.error('Error fetching driver location:', err);
      setError('Erro ao obter localização do motorista');
    }
  };

  const handleLocationUpdate = (location: DriverLocation) => {
    if (!location || !location.latitude || !location.longitude) return;
    
    setDriverLocation(location);
    
    // Update the marker on the map if map is available
    if (map && location.longitude && location.latitude) {
      updateMapMarker(location);
      
      // Format last update time
      if (location.timestamp) {
        setLastUpdate(
          formatDistanceToNow(new Date(location.timestamp), {
            addSuffix: true,
            locale: ptBR
          })
        );
      }
      
      // Show ETA if available
      const etaSeconds = location.eta_seconds;
      if (etaSeconds) {
        console.log(`ETA: ${Math.round(etaSeconds / 60)} minutos`);
      }
    }
  };

  const updateMapMarker = (location: DriverLocation) => {
    if (!map) return;
    
    // Find or create marker
    const marker = document.getElementById(markerId || 'driver-marker');
    
    if (marker) {
      // Update existing marker
      const markerLngLat = [location.longitude, location.latitude];
      
      // Update marker location using Mapbox's API
      const mapboxMarker = map.getMarkerById?.(markerId || 'driver-marker');
      if (mapboxMarker) {
        mapboxMarker.setLngLat(markerLngLat);
      } else {
        // If map.getMarkerById is not available, we need to use Mapbox's normal API
        // This would require keeping track of the marker instance elsewhere
        console.log('Marker reference not found in map');
      }
      
      // Update marker rotation if heading is available
      if (location.heading !== null && location.heading !== undefined) {
        marker.style.transform = `rotate(${location.heading}deg)`;
      }
    } else {
      console.log('Marker element not found in DOM');
    }
  };

  if (error) {
    return (
      <div className="text-yellow-500 flex items-center gap-2 text-sm">
        <AlertTriangle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  return (
    <div className="text-sm">
      {driverLocation ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-blue-600">
            <Navigation className="h-4 w-4" />
            <span>Motorista em movimento</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Atualizado {lastUpdate}</span>
          </div>
          
          {driverLocation.eta_seconds && (
            <div className="mt-1 font-medium">
              ETA: {Math.round(driverLocation.eta_seconds / 60)} minutos
            </div>
          )}
        </div>
      ) : (
        <div className="text-muted-foreground">
          Aguardando atualização de localização...
        </div>
      )}
    </div>
  );
};

export default LiveDriverTracker;
