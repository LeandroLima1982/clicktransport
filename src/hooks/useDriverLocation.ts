
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LocationState {
  location: GeolocationPosition | null;
  error: GeolocationPositionError | null;
  isTracking: boolean;
  lastUpdateTime: Date | null;
  uploading: boolean;
  isUpdating?: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  updateNow: () => void;
}

export const useDriverLocation = (driverId: string | null): LocationState => {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  
  // Use refs to hold the watch ID and tracking state for use in cleanup
  const watchIdRef = useRef<number | null>(null);
  const trackingRef = useRef<boolean>(false);

  // Save location to Supabase
  const saveLocation = useCallback(async (position: GeolocationPosition, orderId?: string) => {
    if (!driverId) return;
    
    try {
      setUploading(true);
      
      const { error } = await supabase
        .from('driver_locations')
        .upsert({
          driver_id: driverId,
          order_id: orderId || currentOrderId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          heading: position.coords.heading || null,
          speed: position.coords.speed || null,
          accuracy: position.coords.accuracy || null,
          timestamp: new Date().toISOString()
        }, {
          onConflict: 'driver_id'
        });
      
      if (error) {
        console.error('Error saving location:', error);
        return false;
      }
      
      setLastUpdateTime(new Date());
      return true;
    } catch (error) {
      console.error('Error in saveLocation:', error);
      return false;
    } finally {
      setUploading(false);
    }
  }, [driverId, currentOrderId]);

  // Success handler for geolocation
  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setLocation(position);
    setError(null);
    setIsUpdating(false);
    
    // Save location if we're actively tracking
    if (trackingRef.current) {
      saveLocation(position);
    }
  }, [saveLocation]);

  // Error handler for geolocation
  const handleError = useCallback((error: GeolocationPositionError) => {
    setError(error);
    setIsUpdating(false);
    console.error('Geolocation error:', error);
    
    if (error.code === error.PERMISSION_DENIED) {
      toast.error('Permissão de localização negada', {
        description: 'Por favor, habilite o acesso à localização para rastrear sua posição.'
      });
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      toast.error('Localização indisponível', {
        description: 'Não foi possível determinar sua posição atual.'
      });
    } else if (error.code === error.TIMEOUT) {
      toast.error('Tempo esgotado', {
        description: 'A solicitação de localização expirou.'
      });
    }
  }, []);

  // Function to start tracking location
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não suportada', {
        description: 'Seu navegador não suporta geolocalização.'
      });
      return;
    }

    // Clear any existing watchers
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setIsTracking(true);
    trackingRef.current = true;
    
    // Start watching position
    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 10000, // 10 seconds
        timeout: 60000 // 1 minute
      }
    );
    
    watchIdRef.current = watchId;
    
    // Also get position immediately
    setIsUpdating(true);
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: true }
    );
    
    toast.success('Rastreamento iniciado', {
      description: 'Sua localização está sendo monitorada em tempo real.'
    });
  }, [handleSuccess, handleError]);

  // Function to stop tracking location
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    setIsTracking(false);
    trackingRef.current = false;
    setCurrentOrderId(null);
    
    toast.info('Rastreamento finalizado', {
      description: 'O monitoramento de localização foi interrompido.'
    });
  }, []);

  // Function to force an immediate location update
  const updateNow = useCallback(() => {
    if (!navigator.geolocation) return;
    
    setIsUpdating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position);
        setIsUpdating(false);
        if (driverId) {
          saveLocation(position);
        }
      },
      (err) => {
        handleError(err);
        setIsUpdating(false);
      },
      { enableHighAccuracy: true }
    );
  }, [driverId, handleError, saveLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    location,
    error,
    isTracking,
    lastUpdateTime,
    uploading,
    isUpdating,
    startTracking,
    stopTracking,
    updateNow
  };
};
