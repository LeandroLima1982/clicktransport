
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatTravelTime } from '@/utils/routeUtils';
import { Clock, MapPin } from 'lucide-react';

interface LiveDriverTrackerProps {
  orderId: string;
  onLocationUpdate?: (coords: [number, number], heading?: number) => void;
  onEtaUpdate?: (etaSeconds: number) => void;
}

export const LiveDriverTracker: React.FC<LiveDriverTrackerProps> = ({
  orderId,
  onLocationUpdate,
  onEtaUpdate
}) => {
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial fetch of driver location
  useEffect(() => {
    const fetchDriverLocation = async () => {
      try {
        const { data, error } = await supabase
          .from('driver_locations')
          .select('*')
          .eq('order_id', orderId)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // Not found is expected sometimes
            console.error('Error fetching driver location:', error);
            setError('Não foi possível obter a localização atual do motorista.');
          }
        } else if (data) {
          setDriverLocation(data);
          
          // Call the location update callback
          if (onLocationUpdate && data.latitude && data.longitude) {
            onLocationUpdate([data.longitude, data.latitude], data.heading);
          }
          
          // Call the ETA update callback
          if (onEtaUpdate && data.eta_seconds) {
            onEtaUpdate(data.eta_seconds);
          }
        }
      } catch (err) {
        console.error('Exception fetching driver location:', err);
        setError('Erro ao buscar localização do motorista.');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverLocation();
  }, [orderId, onLocationUpdate, onEtaUpdate]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`order_driver_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_locations',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          console.log('Driver location update:', payload);
          setDriverLocation(payload.new);
          
          // Call the location update callback
          if (onLocationUpdate && payload.new.latitude && payload.new.longitude) {
            onLocationUpdate(
              [payload.new.longitude, payload.new.latitude],
              payload.new.heading
            );
          }
          
          // Call the ETA update callback
          if (onEtaUpdate && payload.new.eta_seconds) {
            onEtaUpdate(payload.new.eta_seconds);
          }
        }
      )
      .subscribe((status) => {
        console.log('Driver location subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, onLocationUpdate, onEtaUpdate]);

  if (loading) {
    return (
      <div className="p-3 bg-muted/50 rounded-md animate-pulse">
        <p className="text-sm text-muted-foreground">Buscando informações do motorista...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-destructive/10 rounded-md">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!driverLocation) {
    return (
      <div className="p-3 bg-muted/50 rounded-md">
        <p className="text-sm text-muted-foreground">Motorista ainda não iniciou rastreamento.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-primary/5 rounded-md border border-primary/20">
      <h3 className="text-sm font-medium mb-3">Rastreamento em Tempo Real</h3>
      
      <div className="space-y-2">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-primary mr-2" />
          <div className="text-sm">
            <span className="font-medium">Localização atual:</span>
            <span className="ml-1 font-mono text-xs">
              {driverLocation.latitude.toFixed(5)}, {driverLocation.longitude.toFixed(5)}
            </span>
          </div>
        </div>
        
        {driverLocation.eta_seconds && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-primary mr-2" />
            <div className="text-sm">
              <span className="font-medium">Tempo estimado de chegada:</span>
              <span className="ml-1">
                {formatTravelTime(Math.ceil(driverLocation.eta_seconds / 60))}
              </span>
            </div>
          </div>
        )}
        
        {driverLocation.speed && (
          <div className="flex items-center">
            <svg className="h-4 w-4 text-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
            <div className="text-sm">
              <span className="font-medium">Velocidade:</span>
              <span className="ml-1">
                {Math.round(driverLocation.speed * 3.6)} km/h
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 mt-3 flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1.5"></span>
        Atualizado {formatTimestamp(driverLocation.timestamp || driverLocation.updated_at)}
      </div>
    </div>
  );
};

// Helper function to format the timestamp in a user-friendly way
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffSeconds < 10) return 'agora mesmo';
  if (diffSeconds < 60) return `há ${diffSeconds} segundos`;
  if (diffSeconds < 3600) return `há ${Math.floor(diffSeconds / 60)} minutos`;
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default LiveDriverTracker;
