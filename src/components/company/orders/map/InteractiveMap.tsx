
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from '@/utils/mapbox';

interface InteractiveMapProps {
  originCoords: [number, number];
  destinationCoords: [number, number];
  routeGeometry: any;
  originAddress?: string;
  destinationAddress?: string;
  currentLocation?: [number, number] | null;
  heading?: number;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  originCoords, 
  destinationCoords, 
  routeGeometry,
  originAddress = 'Origem',
  destinationAddress = 'Destino',
  currentLocation = null,
  heading
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const vehicleMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
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
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        zoom: 12,
        center: originCoords, // Start centered on origin
        minZoom: 2,
        fadeDuration: 0, // Disable fade animations to help with rendering
        renderWorldCopies: false, // Disable rendering multiple copies of world to reduce load
        attributionControl: false, // Disable attribution to simplify the map
      });

      // Handle successful map load
      map.current.on('load', () => {
        if (!map.current) return;
        
        try {
          console.log("Map loaded successfully, adding markers");
          
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
          // We'll use this for animation if no real-time data is available
          // or for showing the real-time position otherwise
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
          if (routeGeometry) {
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
        }
      });
    } catch (error) {
      console.error('Error creating Mapbox instance:', error);
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
    };
  }, [originCoords, destinationCoords, routeGeometry, originAddress, destinationAddress]);

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

  return (
    <div 
      ref={mapContainer} 
      className="absolute inset-0" 
      style={{ minHeight: "400px", backgroundColor: "#e9e9e9" }}
    />
  );
};

export default InteractiveMap;
