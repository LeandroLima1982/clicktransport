
import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { GOOGLE_MAPS_API_KEY, loadGoogleMapsScript, isValidApiKey } from '@/utils/googlemaps';

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
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
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
      // Apply explicit styling to ensure map container is visible
      if (mapContainer.current) {
        mapContainer.current.style.minHeight = '400px';
        mapContainer.current.style.height = '100%';
        mapContainer.current.style.width = '100%';
        mapContainer.current.style.backgroundColor = '#e9e9e9';
        mapContainer.current.style.position = 'relative';
        mapContainer.current.style.display = 'block';
      }
      
      if (!isValidApiKey()) {
        console.error('Invalid Google Maps API key');
        setMapInitError('Google Maps API key is invalid or missing');
        if (onMapLoadFailure) onMapLoadFailure();
        return;
      }
      
      loadGoogleMapsScript(() => {
        try {
          console.log('Initializing Google Maps with coordinates:', originCoords, destinationCoords);
          // Create the map instance
          map.current = new google.maps.Map(mapContainer.current!, {
            center: { lat: originCoords[1], lng: originCoords[0] },
            zoom: 12,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true
          });
          
          // Clear the timeout since map loaded successfully
          if (initTimerRef.current) {
            clearTimeout(initTimerRef.current);
            initTimerRef.current = null;
          }
          
          // Handle successful map load
          setIsMapLoading(false);
          
          // Create directions renderer
          directionsRendererRef.current = new google.maps.DirectionsRenderer({
            map: map.current,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#3887be',
              strokeWeight: 5,
              strokeOpacity: 0.75
            }
          });
          
          // Add origin and destination markers
          new google.maps.Marker({
            position: { lat: originCoords[1], lng: originCoords[0] },
            map: map.current,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#00FF00',
              fillOpacity: 1,
              strokeWeight: 0,
              scale: 7
            },
            title: originAddress
          });
          
          new google.maps.Marker({
            position: { lat: destinationCoords[1], lng: destinationCoords[0] },
            map: map.current,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#FF0000',
              fillOpacity: 1,
              strokeWeight: 0,
              scale: 7
            },
            title: destinationAddress
          });
          
          // Create marker for the vehicle if current location exists
          if (currentLocation) {
            marker.current = new google.maps.Marker({
              position: { lat: currentLocation[1], lng: currentLocation[0] },
              map: map.current,
              icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                fillColor: '#3FB1CE',
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: '#FFFFFF',
                scale: 5,
                rotation: heading || 0
              }
            });
          }
          
          // Set bounds to include both markers
          const bounds = new google.maps.LatLngBounds()
            .extend({ lat: originCoords[1], lng: originCoords[0] })
            .extend({ lat: destinationCoords[1], lng: destinationCoords[0] });
          
          // If we have current location, include it in the bounds
          if (currentLocation) {
            bounds.extend({ lat: currentLocation[1], lng: currentLocation[0] });
          }
          
          map.current.fitBounds(bounds, 70);
          
          // If route geometry is available, draw the route
          if (routeGeometry?.coordinates?.length > 0) {
            // Use directions service to draw the route
            const directionsService = new google.maps.DirectionsService();
            
            directionsService.route(
              {
                origin: { lat: originCoords[1], lng: originCoords[0] },
                destination: { lat: destinationCoords[1], lng: destinationCoords[0] },
                travelMode: google.maps.TravelMode.DRIVING
              },
              (result, status) => {
                console.log('Directions service result:', status);
                if (status === google.maps.DirectionsStatus.OK && result) {
                  directionsRendererRef.current!.setDirections(result);
                } else {
                  console.error('Directions service failed:', status);
                }
              }
            );
          }
          
        } catch (error) {
          console.error('Error initializing Google Maps:', error);
          setMapInitError(`Error initializing map: ${error}`);
          if (onMapLoadFailure) {
            onMapLoadFailure();
          }
        }
      });
      
    } catch (error) {
      console.error('Error creating Google Maps instance:', error);
      setMapInitError(`Error creating map instance: ${error}`);
      if (onMapLoadFailure) {
        onMapLoadFailure();
      }
    }

    // Cleanup on unmount
    return () => {
      if (initTimerRef.current) {
        clearTimeout(initTimerRef.current);
        initTimerRef.current = null;
      }
    };
  }, [originCoords, destinationCoords, routeGeometry, originAddress, destinationAddress, currentLocation, heading, onMapLoadFailure]);

  // Update vehicle marker position when currentLocation changes
  useEffect(() => {
    if (!map.current || !currentLocation) return;

    const position = { lat: currentLocation[1], lng: currentLocation[0] };

    // Update existing marker or create new one
    if (marker.current) {
      marker.current.setPosition(position);
      
      if (heading !== undefined) {
        const icon = marker.current.getIcon() as google.maps.Symbol;
        icon.rotation = heading;
        marker.current.setIcon(icon);
      }
    } else {
      marker.current = new google.maps.Marker({
        position,
        map: map.current,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          fillColor: '#3FB1CE',
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: '#FFFFFF',
          scale: 5,
          rotation: heading || 0
        }
      });
    }

    // Check if the marker is in the current viewport
    const bounds = map.current.getBounds();
    if (bounds && !bounds.contains(position)) {
      // If not in viewport, adjust the map view
      map.current.panTo(position);
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
            <p className="text-xs text-muted-foreground mt-1">{mapInitError}</p>
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
