
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map, Marker } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { AlertCircle, Navigation2 } from 'lucide-react';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import { toast } from 'sonner';
import { getMapboxToken } from '@/utils/mapbox';

interface DriverMapProps {
  driverId: string | null;
  origin?: string;
  destination?: string;
  autoStartTracking?: boolean;
}

const DriverMap: React.FC<DriverMapProps> = ({ 
  driverId, 
  origin, 
  destination,
  autoStartTracking = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const driverMarker = useRef<Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const { 
    location, 
    isTracking, 
    startTracking, 
    stopTracking, 
    updateNow,
    error: locationError
  } = useDriverLocation(driverId || '');

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    const token = getMapboxToken();
    if (!token) {
      console.error('Mapbox token not available');
      return;
    }
    
    mapboxgl.accessToken = token;
    
    const initialLocation = location?.coords || { latitude: -23.5505, longitude: -46.6333 }; // São Paulo default
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLocation.longitude, initialLocation.latitude],
      zoom: 12
    });
    
    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Add navigation control
      map.current?.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Create driver marker
      const el = document.createElement('div');
      el.id = "driver-marker";
      el.className = 'driver-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundImage = 'url(/vehicle-icon.svg)';
      el.style.backgroundSize = 'cover';
      el.style.borderRadius = '50%';
      
      driverMarker.current = new mapboxgl.Marker(el)
        .setLngLat([initialLocation.longitude, initialLocation.latitude])
        .addTo(map.current);
      
      // Start tracking automatically if requested
      if (autoStartTracking && !isTracking) {
        startTracking();
      }
    });
    
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update driver location on map
  useEffect(() => {
    if (!map.current || !location || !mapLoaded) return;
    
    const { latitude, longitude } = location.coords;
    
    // Update marker position
    if (driverMarker.current) {
      driverMarker.current.setLngLat([longitude, latitude]);
    } else {
      // Create marker if it doesn't exist
      const el = document.createElement('div');
      el.id = "driver-marker";
      el.className = 'driver-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundImage = 'url(/vehicle-icon.svg)';
      el.style.backgroundSize = 'cover';
      el.style.borderRadius = '50%';
      
      driverMarker.current = new mapboxgl.Marker(el)
        .setLngLat([longitude, latitude])
        .addTo(map.current);
    }
    
    // Pan map to driver location
    map.current.panTo([longitude, latitude], { duration: 500 });
    
    // Update marker rotation if heading is available
    if (location.coords.heading !== null && location.coords.heading !== undefined) {
      const markerEl = document.getElementById('driver-marker');
      if (markerEl) {
        markerEl.style.transform = `rotate(${location.coords.heading}deg)`;
      }
    }
  }, [location, mapLoaded]);

  // Handle location tracking error
  useEffect(() => {
    if (locationError) {
      toast.error('Erro de localização', {
        description: locationError.message,
        duration: 5000
      });
    }
  }, [locationError]);

  // Handle route display
  useEffect(() => {
    // Only attempt to add route if we have origin and destination
    if (!map.current || !mapLoaded || !origin || !destination) return;
    
    const getRoute = async () => {
      try {
        const token = getMapboxToken();
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${encodeURIComponent(origin)};${encodeURIComponent(destination)}?geometries=geojson&access_token=${token}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          
          // Add route to map
          if (map.current?.getSource('route')) {
            // Update existing source
            const source = map.current.getSource('route');
            if ('setData' in source) {
              source.setData({
                type: 'Feature',
                properties: {},
                geometry: route.geometry
              });
            }
          } else {
            // Add new source and layer
            map.current?.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: route.geometry
              }
            });
            
            map.current?.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#3887be',
                'line-width': 5,
                'line-opacity': 0.75
              }
            });
          }
          
          // Fit bounds to show entire route
          const bounds = new mapboxgl.LngLatBounds();
          route.geometry.coordinates.forEach((coord) => {
            bounds.extend(coord as [number, number]);
          });
          
          map.current?.fitBounds(bounds, {
            padding: 50,
            duration: 1000
          });
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };
    
    getRoute();
  }, [origin, destination, mapLoaded]);

  const handleStartTracking = () => {
    startTracking();
    toast.success('Localização ativada', {
      description: 'O mapa agora mostrará sua localização em tempo real.'
    });
  };
  
  const handleStopTracking = () => {
    stopTracking();
    toast.info('Localização desativada', {
      description: 'O rastreamento de localização foi interrompido.'
    });
  };
  
  const handleUpdateLocation = () => {
    updateNow();
    toast.success('Localização atualizada', {
      description: 'Sua posição foi atualizada no mapa.'
    });
  };

  return (
    <div className="space-y-4">
      <div 
        ref={mapContainer} 
        className="w-full h-[400px] rounded-lg border border-border"
      />
      
      <div className="flex gap-2 items-center">
        {!isTracking ? (
          <Button 
            onClick={handleStartTracking}
            className="flex items-center gap-2"
            variant="default"
          >
            <Navigation2 className="h-4 w-4" />
            Iniciar rastreamento
          </Button>
        ) : (
          <>
            <Button 
              onClick={handleStopTracking}
              className="flex items-center gap-2"
              variant="destructive"
            >
              Parar rastreamento
            </Button>
            
            <Button 
              onClick={handleUpdateLocation}
              className="flex items-center gap-2"
              variant="outline"
            >
              Atualizar agora
            </Button>
          </>
        )}
        
        {locationError && (
          <div className="text-red-500 flex items-center gap-2 text-sm ml-auto">
            <AlertCircle className="h-4 w-4" />
            Erro: {locationError.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverMap;
