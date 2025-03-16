
import { useState, useEffect, useRef } from 'react';
import { updateDriverLocation, subscribeToDriverLocation } from '@/services/location/driverLocationService';
import { logError } from '@/services/monitoring/systemLogService';

interface LocationOptions {
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
  updateInterval?: number;
}

const DEFAULT_OPTIONS: LocationOptions = {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 5000,
  updateInterval: 10000 // 10 seconds
};

export const useDriverLocation = (
  driverId: string | null, 
  orderId: string | null = null,
  options: LocationOptions = {}
) => {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // Start tracking the driver's location
  const startTracking = () => {
    if (!driverId || !navigator.geolocation) {
      setError({ code: 2, message: !driverId ? 'Driver ID is required' : 'Geolocation not supported', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 });
      return;
    }
    
    setIsTracking(true);
    
    // Watch for location changes
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      {
        enableHighAccuracy: mergedOptions.enableHighAccuracy,
        maximumAge: mergedOptions.maximumAge,
        timeout: mergedOptions.timeout
      }
    );
    
    // Set up periodic updates to the server
    intervalRef.current = window.setInterval(() => {
      if (location) {
        uploadLocationToServer(location);
      }
    }, mergedOptions.updateInterval);
    
    return () => stopTracking();
  };
  
  // Stop tracking the driver's location
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsTracking(false);
  };
  
  // Handle position updates
  const handlePositionUpdate = (position: GeolocationPosition) => {
    setLocation(position);
    setLastUpdateTime(new Date());
    setError(null);
    
    // Upload location immediately on first acquisition
    if (!location) {
      uploadLocationToServer(position);
    }
  };
  
  // Handle position errors
  const handlePositionError = (error: GeolocationPositionError) => {
    setError(error);
    logError('Error getting driver location', 'driver', {
      driver_id: driverId,
      error: { code: error.code, message: error.message }
    });
  };
  
  // Upload location to server
  const uploadLocationToServer = async (position: GeolocationPosition) => {
    if (!driverId) return;
    
    try {
      setUploading(true);
      
      const { latitude, longitude, accuracy, heading, speed } = position.coords;
      
      const result = await updateDriverLocation(
        driverId,
        orderId,
        latitude,
        longitude,
        heading || undefined,
        speed || undefined,
        accuracy
      );
      
      if (!result.success) {
        console.error('Failed to update location on server:', result.error);
      }
    } catch (error) {
      console.error('Error uploading location to server:', error);
    } finally {
      setUploading(false);
    }
  };
  
  // Force an immediate location update
  const updateNow = () => {
    if (navigator.geolocation && isTracking) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handlePositionUpdate(position);
          uploadLocationToServer(position);
        },
        handlePositionError,
        {
          enableHighAccuracy: mergedOptions.enableHighAccuracy,
          maximumAge: 0, // Force fresh location
          timeout: mergedOptions.timeout
        }
      );
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
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
};
