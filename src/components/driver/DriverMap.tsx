import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loader2 } from 'lucide-react';
import { MAPBOX_TOKEN } from '@/utils/mapbox';
import { calculateRoute } from '@/utils/routeUtils';
import { supabase } from '@/integrations/supabase/client';

interface DriverMapProps {
  currentOrder: any;
  currentLocation?: [number, number];
  heading?: number;
  onEtaUpdate?: (eta: number) => void;
}

const DriverMap: React.FC<DriverMapProps> = ({ 
  currentOrder, 
  currentLocation,
  heading,
  onEtaUpdate
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const routeRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<any>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<Date | null>(null);
  const [distanceRemaining, setDistanceRemaining] = useState<number | null>(null);
  
  useEffect(() => {
    if (!mapContainer.current) return;
    
    if (!MAPBOX_TOKEN) {
      setError('Mapbox token is missing. Please configure it in the environment settings.');
      setLoading(false);
      return;
    }
    
    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        zoom: 12,
        center: currentLocation || [-43.2096, -22.9035], // Default to Rio de Janeiro
        attributionControl: false
      });
      
      map.current.addControl(
        new mapboxgl.NavigationControl({ showCompass: true }),
        'bottom-right'
      );
      
      map.current.on('load', () => {
        setLoading(false);
        
        fetchRouteAndAddMarkers();
      });
      
      map.current.on('error', (err) => {
        console.error('Map error:', err);
        setError('Erro ao carregar mapa: ' + err.error?.message || 'Erro desconhecido');
        setLoading(false);
      });
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Erro ao inicializar mapa');
      setLoading(false);
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!currentOrder?.id) return;

    const channel = supabase
      .channel(`order_drivers_${currentOrder.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_locations',
          filter: `order_id=eq.${currentOrder.id}`
        },
        (payload) => {
          console.log('Driver location updated:', payload);
          updateDriverMarker(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('Driver location subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentOrder?.id]);
  
  const updateDriverMarker = (driverData: any) => {
    if (!map.current || !driverData) return;
    
    if (driverData.driver_id === currentOrder.driver_id) return;
    
    const coords: [number, number] = [driverData.longitude, driverData.latitude];
    const markerId = `driver-${driverData.driver_id}`;
    
    const existingMarker = document.getElementById(markerId);
    if (existingMarker) {
      const marker = map.current.getMarkerById(markerId);
      if (marker) {
        marker.setLngLat(coords);
        if (driverData.heading) {
          marker.setRotation(driverData.heading);
        }
      }
    } else {
      const el = document.createElement('div');
      el.className = 'other-vehicle-marker';
      el.id = markerId;
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.backgroundImage = 'url(/vehicle-icon.svg)';
      el.style.backgroundSize = 'cover';
      el.style.transform = `rotate(${driverData.heading || 0}deg)`;
      
      new mapboxgl.Marker({
        element: el,
        rotationAlignment: 'map'
      })
        .setLngLat(coords)
        .addTo(map.current);
    }
  };
  
  const fetchRouteAndAddMarkers = async () => {
    if (!map.current || !currentOrder) return;
    
    try {
      const routeInfo = await calculateRoute(currentOrder.origin, currentOrder.destination);
      
      if (routeInfo && routeInfo.geometry) {
        setRouteGeometry(routeInfo.geometry);
        routeRef.current = routeInfo;
        
        if (routeInfo.duration) {
          const eta = new Date();
          eta.setSeconds(eta.getSeconds() + routeInfo.duration * 60);
          setEstimatedArrival(eta);
          
          if (onEtaUpdate) {
            onEtaUpdate(routeInfo.duration * 60);
          }
        }
        
        new mapboxgl.Marker({ color: '#00FF00' })
          .setLngLat(routeInfo.geometry.coordinates[0])
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>Origem</h3><p>${currentOrder.origin}</p>`))
          .addTo(map.current);
        
        new mapboxgl.Marker({ color: '#FF0000' })
          .setLngLat(routeInfo.geometry.coordinates[routeInfo.geometry.coordinates.length - 1])
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>Destino</h3><p>${currentOrder.destination}</p>`))
          .addTo(map.current);
        
        if (map.current.getSource('route')) {
          const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
          source.setData({
            type: 'Feature',
            properties: {},
            geometry: routeInfo.geometry
          });
        } else {
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: routeInfo.geometry
            }
          });
          
          map.current.addLayer({
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
        
        const bounds = new mapboxgl.LngLatBounds();
        routeInfo.geometry.coordinates.forEach((coord: [number, number]) => {
          bounds.extend(coord);
        });
        
        map.current.fitBounds(bounds, {
          padding: 50,
          duration: 1000
        });
      } else {
        console.error('No route geometry returned');
      }
    } catch (err) {
      console.error('Error fetching route:', err);
    }
  };
  
  useEffect(() => {
    if (!map.current || !currentLocation) return;
    
    if (routeRef.current && routeRef.current.geometry && onEtaUpdate) {
      try {
        const remaining = calculateRemainingDistance(currentLocation, routeRef.current.geometry.coordinates);
        setDistanceRemaining(remaining / 1000);
        
        const speedKmh = estimateCurrentSpeed(remaining);
        const remainingTimeSeconds = (remaining / 1000) / (speedKmh / 3600);
        
        const eta = new Date();
        eta.setSeconds(eta.getSeconds() + remainingTimeSeconds);
        setEstimatedArrival(eta);
        
        onEtaUpdate(remainingTimeSeconds);
        
        console.log(`Updated ETA: ${formatTime(remainingTimeSeconds)}, Distance: ${(remaining/1000).toFixed(2)}km, Speed: ${speedKmh.toFixed(1)}km/h`);
      } catch (err) {
        console.error('Error updating ETA:', err);
      }
    }
    
    if (markerRef.current) {
      markerRef.current.remove();
    }
    
    const el = document.createElement('div');
    el.className = 'vehicle-marker';
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.backgroundImage = 'url(/vehicle-icon.svg)';
    el.style.backgroundSize = 'cover';
    el.style.transform = `rotate(${heading || 0}deg)`;
    
    markerRef.current = new mapboxgl.Marker({
      element: el,
      rotationAlignment: 'map'
    })
      .setLngLat(currentLocation)
      .addTo(map.current);
    
    if (!loading) {
      map.current.easeTo({
        center: currentLocation,
        zoom: 15,
        duration: 1000
      });
    }
  }, [currentLocation, heading, onEtaUpdate]);
  
  const estimateCurrentSpeed = (distanceRemaining: number): number => {
    const baseSpeed = 40;
    
    if (currentLocation && navigator.geolocation) {
      const actualSpeed = navigator.geolocation.getCurrentPosition(
        (position) => position.coords.speed || 0
      );
      if (actualSpeed) {
        return actualSpeed * 3.6;
      }
    }
    
    if (distanceRemaining > 10000) return baseSpeed + 20;
    if (distanceRemaining > 5000) return baseSpeed + 10;
    if (distanceRemaining > 1000) return baseSpeed;
    return baseSpeed - 10;
  };
  
  const calculateRemainingDistance = (currentLocation: [number, number], routeCoordinates: [number, number][]) => {
    let minDistance = Infinity;
    let closestPointIndex = 0;
    
    routeCoordinates.forEach((coord, index) => {
      const distance = getDistance(currentLocation, coord);
      if (distance < minDistance) {
        minDistance = distance;
        closestPointIndex = index;
      }
    });
    
    let remainingDistance = 0;
    for (let i = closestPointIndex; i < routeCoordinates.length - 1; i++) {
      remainingDistance += getDistance(routeCoordinates[i], routeCoordinates[i + 1]);
    }
    
    return remainingDistance;
  };
  
  const getDistance = (point1: [number, number], point2: [number, number]) => {
    const R = 6371e3;
    const φ1 = point1[1] * Math.PI/180;
    const φ2 = point2[1] * Math.PI/180;
    const Δφ = (point2[1] - point1[1]) * Math.PI/180;
    const Δλ = (point2[0] - point1[0]) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    
    return d;
  };
  
  const formatDistance = () => {
    if (distanceRemaining === null) return 'Calculando...';
    if (distanceRemaining < 1) return `${Math.round(distanceRemaining * 1000)} m`;
    return `${distanceRemaining.toFixed(1)} km`;
  };
  
  const formatEta = () => {
    if (!estimatedArrival) return 'Calculando...';
    return estimatedArrival.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  };
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-center text-destructive">
          <p className="font-medium">{error}</p>
          <p className="text-sm mt-1">Verifique sua conexão e as configurações do mapa</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 bg-opacity-70">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="mt-2">Carregando mapa...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapContainer} 
        className="h-full w-full rounded-lg" 
      />
      
      {(estimatedArrival || distanceRemaining !== null) && (
        <div className="absolute bottom-4 left-4 z-10 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 font-medium">Chegada prevista</div>
              <div className="text-lg font-bold text-primary">{formatEta()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">Distância restante</div>
              <div className="text-lg font-bold text-primary">{formatDistance()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverMap;
