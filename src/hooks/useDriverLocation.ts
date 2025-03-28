
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LocationState {
  coords: GeolocationCoordinates;
  timestamp: number;
}

export function useDriverLocation(driverId: string | null) {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [uploading, setUploading] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const uploadIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to update location in the database
  const updateLocationInDb = useCallback(async (position: GeolocationPosition) => {
    if (!driverId) return;
    
    setUploading(true);
    try {
      const { coords } = position;
      
      const locationData = {
        driver_id: driverId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        heading: coords.heading || null,
        speed: coords.speed || null,
        accuracy: coords.accuracy || null,
        timestamp: new Date().toISOString(),
        order_id: currentOrderId
      };
      
      const { error } = await supabase
        .from('driver_locations')
        .upsert(locationData, { onConflict: 'driver_id' });
      
      if (error) {
        console.error('Error updating location:', error);
      } else {
        setLastUpdateTime(new Date());
      }
    } catch (err) {
      console.error('Error saving location data:', err);
    } finally {
      setUploading(false);
    }
  }, [driverId, currentOrderId]);

  // Success handler for geolocation
  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setLocation(position);
    setError(null);
    
    // Only update every 10 seconds to reduce database writes
    const now = new Date();
    const timeSinceLastUpdate = now.getTime() - lastUpdateTime.getTime();
    if (timeSinceLastUpdate > 10000 || !lastUpdateTime) {
      updateLocationInDb(position);
    }
  }, [updateLocationInDb, lastUpdateTime]);

  // Error handler for geolocation
  const handleError = useCallback((error: GeolocationPositionError) => {
    setError(error);
    
    let errorMessage;
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Permissão para acessar localização negada.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Informação de localização indisponível.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Tempo esgotado ao obter localização.';
        break;
      default:
        errorMessage = 'Erro desconhecido ao obter localização.';
    }
    
    toast.error(errorMessage);
    setIsTracking(false);
  }, []);

  // Force a location update now
  const updateNow = useCallback(() => {
    if (location) {
      updateLocationInDb(location);
    }
  }, [location, updateLocationInDb]);

  // Start tracking location
  const startTracking = useCallback((orderId?: string) => {
    if (orderId) {
      setCurrentOrderId(orderId);
    }
    
    setIsTracking(true);
    
    if ('geolocation' in navigator) {
      // Clear any existing watch
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      
      // Set up regular uploads
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current);
      }
      
      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 27000
        }
      );
      
      // Set up a backup interval to ensure we're uploading location regularly
      uploadIntervalRef.current = setInterval(() => {
        if (location) {
          updateLocationInDb(location);
        }
      }, 60000); // every minute
      
      // Also get a one-time immediate position
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        { enableHighAccuracy: true }
      );
      
      toast.success('Rastreamento de localização iniciado');
      
      return () => stopTracking();
    } else {
      toast.error('Geolocalização não suportada neste dispositivo');
      setIsTracking(false);
    }
  }, [handleSuccess, handleError, updateLocationInDb, location]);

  // Stop tracking location
  const stopTracking = useCallback(() => {
    setIsTracking(false);
    
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (uploadIntervalRef.current) {
      clearInterval(uploadIntervalRef.current);
      uploadIntervalRef.current = null;
    }
    
    setCurrentOrderId(null);
    toast.info('Rastreamento de localização desativado');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current);
      }
    };
  }, []);

  return {
    location,
    error,
    isTracking,
    lastUpdateTime,
    uploading,
    startTracking,
    stopTracking,
    updateNow
  };
}
