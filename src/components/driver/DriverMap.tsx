
import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { GOOGLE_MAPS_API_KEY, loadGoogleMapsScript } from '@/utils/googlemaps';
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
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current) return;
    
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
      setError('Google Maps API key is missing. Please configure it in the environment settings.');
      setLoading(false);
      return;
    }
    
    loadGoogleMapsScript(() => {
      try {
        // Create map instance
        mapRef.current = new google.maps.Map(mapContainer.current, {
          center: { lat: -22.9035, lng: -43.2096 }, // Default to Rio de Janeiro
          zoom: 12,
          mapTypeControl: false,
          fullscreenControl: true,
          streetViewControl: false
        });
        
        // Create directions renderer
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          map: mapRef.current,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#3887BE',
            strokeWeight: 5,
            strokeOpacity: 0.75
          }
        });
        
        setLoading(false);
        
        // Add origin and destination markers if we have an order
        if (currentOrder) {
          fetchRouteAndAddMarkers();
        }
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Erro ao inicializar mapa');
        setLoading(false);
      }
    });
    
    // Clean up on unmount
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, []);
  
  // Fetch route and add markers
  const fetchRouteAndAddMarkers = async () => {
    if (!mapRef.current || !currentOrder || !directionsRendererRef.current) return;
    
    try {
      const directionsService = new google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin: currentOrder.origin,
          destination: currentOrder.destination,
          travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            // Display the route
            if (directionsRendererRef.current) {
              directionsRendererRef.current.setDirections(result);
            }
            
            // Add origin marker
            new google.maps.Marker({
              position: result.routes[0].legs[0].start_location,
              map: mapRef.current,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#00FF00',
                fillOpacity: 1,
                strokeWeight: 0,
                scale: 7
              },
              title: 'Origem'
            });
            
            // Add destination marker
            new google.maps.Marker({
              position: result.routes[0].legs[0].end_location,
              map: mapRef.current,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#FF0000',
                fillOpacity: 1,
                strokeWeight: 0,
                scale: 7
              },
              title: 'Destino'
            });
            
            // Fit bounds to include the entire route
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(result.routes[0].legs[0].start_location);
            bounds.extend(result.routes[0].legs[0].end_location);
            mapRef.current?.fitBounds(bounds);
          } else {
            console.error('Directions API error:', status);
          }
        }
      );
    } catch (err) {
      console.error('Error fetching route:', err);
    }
  };
  
  // Update vehicle marker when location changes
  useEffect(() => {
    if (!mapRef.current || !currentLocation) return;
    
    // Remove existing marker if it exists
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    
    // Create and add new marker
    markerRef.current = new google.maps.Marker({
      position: { lat: currentLocation[1], lng: currentLocation[0] },
      map: mapRef.current,
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 5,
        rotation: heading || 0,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#FFFFFF'
      }
    });
    
    // Center map on current location if not first load
    if (!loading) {
      mapRef.current.panTo({ lat: currentLocation[1], lng: currentLocation[0] });
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
