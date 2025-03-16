
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loader2 } from 'lucide-react';
import { MAPBOX_TOKEN } from '@/utils/mapbox';
import { calculateRoute } from '@/utils/routeUtils';

interface DriverMapProps {
  currentOrder: any;
  currentLocation?: [number, number];
  heading?: number;
}

const DriverMap: React.FC<DriverMapProps> = ({ 
  currentOrder, 
  currentLocation,
  heading 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<any>(null);
  
  // Initialize map when component mounts
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
      
      // Handle successful map load
      map.current.on('load', () => {
        setLoading(false);
        
        // Add origin and destination markers
        fetchRouteAndAddMarkers();
      });
      
      // Handle map errors
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
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  // Fetch route and add markers
  const fetchRouteAndAddMarkers = async () => {
    if (!map.current || !currentOrder) return;
    
    try {
      const routeInfo = await calculateRoute(currentOrder.origin, currentOrder.destination);
      
      if (routeInfo && routeInfo.geometry) {
        setRouteGeometry(routeInfo.geometry);
        
        // Add origin marker
        new mapboxgl.Marker({ color: '#00FF00' })
          .setLngLat(routeInfo.geometry.coordinates[0])
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>Origem</h3><p>${currentOrder.origin}</p>`))
          .addTo(map.current);
        
        // Add destination marker
        new mapboxgl.Marker({ color: '#FF0000' })
          .setLngLat(routeInfo.geometry.coordinates[routeInfo.geometry.coordinates.length - 1])
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>Destino</h3><p>${currentOrder.destination}</p>`))
          .addTo(map.current);
        
        // Add route to map
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
        
        // Fit bounds to include the entire route
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
  
  // Update vehicle marker when location changes
  useEffect(() => {
    if (!map.current || !currentLocation) return;
    
    // Remove existing marker if it exists
    if (markerRef.current) {
      markerRef.current.remove();
    }
    
    // Create element for the custom marker
    const el = document.createElement('div');
    el.className = 'vehicle-marker';
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.backgroundImage = 'url(/vehicle-icon.svg)';
    el.style.backgroundSize = 'cover';
    el.style.transform = `rotate(${heading || 0}deg)`;
    
    // Create and add new marker
    markerRef.current = new mapboxgl.Marker({
      element: el,
      rotationAlignment: 'map'
    })
      .setLngLat(currentLocation)
      .addTo(map.current);
    
    // Center map on current location if not first load
    if (!loading) {
      map.current.easeTo({
        center: currentLocation,
        zoom: 15,
        duration: 1000
      });
    }
  }, [currentLocation, heading]);
  
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
    </div>
  );
};

export default DriverMap;
