import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from '@/utils/mapbox';
import { Loader2 } from 'lucide-react';

interface InteractiveMapProps {
  originCoords: [number, number];
  destinationCoords: [number, number];
  routeGeometry: any;
  originAddress?: string;
  destinationAddress?: string;
  currentLocation?: [number, number] | null;
  heading?: number;
  onMapLoadFailure?: () => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  originCoords, 
  destinationCoords, 
  routeGeometry,
  originAddress = 'Origem',
  destinationAddress = 'Destino',
  currentLocation = null,
  heading,
  onMapLoadFailure
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const vehicleMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapInitError, setMapInitError] = useState<string | null>(null);
  const initTimerRef = useRef<number | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Set a timeout to detect stalled map initialization
    const initTimeout = window.setTimeout(() => {
      console.error("Map initialization timed out");
      setMapInitError("Map initialization timed out");
      if (onMapLoadFailure) {
        onMapLoadFailure();
      }
    }, 10000); // 10 seconds timeout

    initTimerRef.current = initTimeout;

    // Initialize map
    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
    
      // Clear any existing map instance
      if (map.current) {
        map.current.remove();
      }

      // Apply explicit styling to ensure map container is visible
      if (mapContainer.current) {
        mapContainer.current.style.minHeight = '400px';
        mapContainer.current.style.height = '100%';
        mapContainer.current.style.width = '100%';
        mapContainer.current.style.backgroundColor = '#e9e9e9';
        mapContainer.current.style.position = 'relative';
        mapContainer.current.style.display = 'block';
      }
    
      // Create new map instance
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        zoom: 12,
        center: originCoords, // Start centered on origin
        minZoom: 2,
        fadeDuration: 0, // Disable fade animations to help with rendering
        renderWorldCopies: false, // Disable rendering multiple copies of world to reduce load
        attributionControl: false, // Disable attribution to simplify the map
        preserveDrawingBuffer: false, // Better performance
        antialias: false, // Better performance on low-end devices
        maxPitch: 45, // Limit pitch to improve performance
        trackResize: true,
      });

      // Handle map errors
      map.current.on('error', (error) => {
        console.error('Mapbox error:', error);
        setMapInitError(`Map error: ${error.error?.message || 'Unknown error'}`);
        if (onMapLoadFailure) {
          onMapLoadFailure();
        }
      });

      // Handle successful map load
      map.current.on('load', () => {
        if (!map.current) return;
        
        // Clear the timeout as map loaded successfully
        if (initTimerRef.current) {
          clearTimeout(initTimerRef.current);
          initTimerRef.current = null;
        }
        
        try {
          console.log("Map loaded successfully, adding markers");
          setIsMapLoading(false);
          
          // Add origin and destination markers
          new mapboxgl.Marker({ color: '#00FF00' })
            .setLngLat(originCoords)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>Origem</h3><p>${originAddress}</p>`))
            .addTo(map.current);
          
          new mapboxgl.Marker({ color: '#FF0000' })
            .setLngLat(destinationCoords)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>Destino</h3><p>${destinationAddress}</p>`))
            .addTo(map.current);
          
          // Create marker for the vehicle
          vehicleMarkerRef.current = new mapboxgl.Marker({ 
            color: '#3FB1CE',
            rotation: heading
          })
            .setLngLat(currentLocation || originCoords)
            .addTo(map.current);
          
          // Set bounds to include both markers
          const bounds = new mapboxgl.LngLatBounds()
            .extend(originCoords)
            .extend(destinationCoords);
          
          // If we have current location, include it in the bounds
          if (currentLocation) {
            bounds.extend(currentLocation);
          }
          
          map.current.fitBounds(bounds, { padding: 70, maxZoom: 15 });
          
          // Add route to map if routeGeometry is available
          if (routeGeometry && routeGeometry.coordinates && routeGeometry.coordinates.length > 0) {
            // Add route to map
            map.current.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: routeGeometry
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

            // Start animation only if we don't have real-time location
            if (!currentLocation && vehicleMarkerRef.current && routeGeometry.coordinates.length > 0) {
              animateMarkerAlongRoute(routeGeometry.coordinates);
            }
          }
        } catch (error) {
          console.error("Error setting up map markers:", error);
          setMapInitError(`Error setting up map markers: ${error}`);
          if (onMapLoadFailure) {
            onMapLoadFailure();
          }
        }
      });
    } catch (error) {
      console.error('Error creating Mapbox instance:', error);
      setMapInitError(`Error creating Mapbox instance: ${error}`);
      if (onMapLoadFailure) {
        onMapLoadFailure();
      }
    }

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      
      // Cancel any ongoing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      // Clear the initialization timeout
      if (initTimerRef.current) {
        clearTimeout(initTimerRef.current);
        initTimerRef.current = null;
      }
    };
  }, [originCoords, destinationCoords, routeGeometry, originAddress, destinationAddress, onMapLoadFailure]);

  const animateMarkerAlongRoute = (coordinates: [number, number][]) => {
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // If we have a very simple route with just two points, add some interpolation
    if (coordinates.length <= 2) {
      const interpolated = [];
      for (let i = 0; i < 100; i++) {
        const ratio = i / 100;
        interpolated.push([
          coordinates[0][0] + (coordinates[1][0] - coordinates[0][0]) * ratio,
          coordinates[0][1] + (coordinates[1][1] - coordinates[0][1]) * ratio
        ]);
      }
      coordinates = interpolated as [number, number][];
    }

    let start: number;
    const animationDuration = 30000; // 30 seconds for the full route animation

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Get the current point along the route based on progress
      const pointIndex = Math.min(
        Math.floor(progress * coordinates.length),
        coordinates.length - 1
      );
      
      // Update marker position
      if (vehicleMarkerRef.current && map.current) {
        vehicleMarkerRef.current.setLngLat(coordinates[pointIndex]);
        
        // Calculate heading (direction) based on the next point
        if (pointIndex < coordinates.length - 1) {
          const currentPoint = coordinates[pointIndex];
          const nextPoint = coordinates[pointIndex + 1];
          const angle = Math.atan2(
            nextPoint[1] - currentPoint[1],
            nextPoint[0] - currentPoint[0]
          ) * (180 / Math.PI);
          
          vehicleMarkerRef.current.setRotation(angle);
        }
      }
      
      // Continue animation if not complete
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete, reset for potential replay
        startTimeRef.current = null;
      }
    };
    
    // Start the animation
    animationRef.current = requestAnimationFrame(animate);
  };

  // Update vehicle marker position when currentLocation changes
  useEffect(() => {
    if (!map.current || !currentLocation || !vehicleMarkerRef.current) return;

    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Update marker position and rotation
    vehicleMarkerRef.current
      .setLngLat(currentLocation);
    
    if (heading !== undefined) {
      vehicleMarkerRef.current.setRotation(heading);
    }

    // Check if the marker is in the current viewport
    const bounds = map.current.getBounds();
    if (!bounds.contains({ lng: currentLocation[0], lat: currentLocation[1] })) {
      // If not in viewport, adjust the map view
      map.current.easeTo({
        center: currentLocation,
        duration: 1000,
        zoom: map.current.getZoom() // Keep current zoom level
      });
    }
  }, [currentLocation, heading]);

  return (
    <div className="relative h-full w-full">
      {isMapLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 bg-opacity-80">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Carregando mapa interativo...</p>
          </div>
        </div>
      )}
      {mapInitError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 bg-opacity-80">
          <div className="text-center max-w-md p-4 bg-destructive/10 rounded-md">
            <p className="text-sm text-destructive font-medium">Erro ao carregar mapa interativo</p>
            <p className="text-xs text-muted-foreground mt-1">Tentando usar mapa estático como alternativa</p>
          </div>
        </div>
      )}
      <div 
        ref={mapContainer} 
        className="absolute inset-0 rounded-md" 
        style={{ minHeight: "400px", backgroundColor: "#e9e9e9" }}
      />
    </div>
  );
};

export default InteractiveMap;
