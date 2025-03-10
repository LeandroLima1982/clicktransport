
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loader2, Navigation } from 'lucide-react';
import { ServiceOrder } from './types';
import { supabase } from '@/main';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MAPBOX_TOKEN } from '@/utils/mapbox';

interface OrderTrackingProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, isOpen, onClose }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [route, setRoute] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [routeDistance, setRouteDistance] = useState(0);
  const [routeDuration, setRouteDuration] = useState(0);
  const [animationStarted, setAnimationStarted] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isOpen, orderId]);

  // Initialize map when order is available
  useEffect(() => {
    if (order && isOpen && mapContainer.current) {
      console.log("Initializing map with order:", order);
      initializeMap(order.origin, order.destination);
    }
  }, [order, isOpen]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setMapError(null);
    try {
      console.log("Fetching order details for ID:", orderId);
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      
      console.log("Order data received:", data);
      setOrder(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setLoading(false);
      toast.error('Erro ao carregar dados da ordem de serviço');
    }
  };

  const initializeMap = async (origin: string, destination: string) => {
    if (!mapContainer.current) {
      console.error("Map container ref is not available");
      setMapError('Não foi possível inicializar o mapa. Elemento não encontrado.');
      return;
    }

    // Use MAPBOX_TOKEN from utils/mapbox
    const token = MAPBOX_TOKEN;
    if (!token) {
      console.error("Mapbox token is missing");
      setMapError('Token do Mapbox não encontrado. Verifique a configuração.');
      return;
    }
    
    try {
      console.log("Initializing map with Mapbox token");
      // Initialize Mapbox
      mapboxgl.accessToken = token;
      
      // Clear any existing map instance
      if (map.current) {
        map.current.remove();
      }
      
      // Create new map instance
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        zoom: 12,
        minZoom: 2,
      });

      // Add specific CSS to ensure the map container is visible
      mapContainer.current.style.minHeight = '100%';
      mapContainer.current.style.backgroundColor = '#f0f0f0';

      map.current.on('load', async () => {
        try {
          console.log("Map loaded, getting coordinates for addresses");
          // Get coordinates from addresses
          const [originCoords, destinationCoords] = await Promise.all([
            getCoordinatesFromAddress(origin),
            getCoordinatesFromAddress(destination)
          ]);
          
          if (!originCoords || !destinationCoords) {
            console.error("Could not get coordinates for addresses", { origin, destination });
            setMapError('Não foi possível obter coordenadas dos endereços fornecidos.');
            return;
          }
          
          console.log("Got coordinates", { originCoords, destinationCoords });
          
          // Create marker for the vehicle
          marker.current = new mapboxgl.Marker({ color: '#3FB1CE' })
            .setLngLat(originCoords)
            .addTo(map.current!);
          
          // Add origin and destination markers
          new mapboxgl.Marker({ color: '#00FF00' })
            .setLngLat(originCoords)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>Origem</h3><p>${origin}</p>`))
            .addTo(map.current!);
          
          new mapboxgl.Marker({ color: '#FF0000' })
            .setLngLat(destinationCoords)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>Destino</h3><p>${destination}</p>`))
            .addTo(map.current!);
          
          // Get directions between points
          console.log("Getting route between points");
          const routeData = await getRoute(originCoords, destinationCoords);
          if (!routeData) {
            console.error("Could not calculate route between points");
            setMapError('Não foi possível calcular a rota entre os pontos.');
            return;
          }
          
          setRoute(routeData);
          console.log("Route data received", routeData);
          
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend(originCoords);
          bounds.extend(destinationCoords);
          
          map.current!.fitBounds(bounds, { padding: 60, maxZoom: 15 });
          
          if (map.current && routeData) {
            console.log("Adding route to map");
            // Add route to map
            map.current.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: routeData.geometry
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
            
            // Calculate route details
            if (routeData && routeData.legs && routeData.legs.length > 0) {
              const leg = routeData.legs[0];
              setRouteDistance(leg.distance);
              setRouteDuration(leg.duration);
            }
          }
        } catch (error) {
          console.error('Error in map initialization:', error);
          setMapError('Erro ao inicializar o mapa. Tente novamente mais tarde.');
        }
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Erro ao carregar o mapa. Verifique sua conexão com a internet.');
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Não foi possível inicializar o mapa. Tente novamente mais tarde.');
    }
  };

  const getCoordinatesFromAddress = async (address: string): Promise<[number, number] | null> => {
    const token = MAPBOX_TOKEN;
    if (!token) return null;
    
    try {
      console.log("Geocoding address:", address);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&country=br&limit=1`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Geocoding response:", data);
      
      if (data.features && data.features.length > 0) {
        return data.features[0].center;
      }
      
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  const getRoute = async (start: [number, number], end: [number, number]) => {
    const token = MAPBOX_TOKEN;
    if (!token) return null;
    
    try {
      console.log("Getting route from", start, "to", end);
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&steps=true&overview=full&access_token=${token}`
      );
      
      if (!response.ok) {
        throw new Error(`Directions API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Route API response:", data);
      
      if (data.routes && data.routes.length > 0) {
        return data.routes[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error getting route:', error);
      return null;
    }
  };

  const startAnimation = () => {
    if (!route || !marker.current || !map.current) {
      toast.error('Não foi possível iniciar a simulação');
      return;
    }
    
    setAnimationStarted(true);
    startTimeRef.current = Date.now();
    
    const animateRoute = (timestamp: number) => {
      if (!startTimeRef.current || !route) return;
      
      const elapsedTime = Date.now() - startTimeRef.current;
      
      // Calculate progress based on elapsed time and route duration
      // We speed up the animation by dividing actual route duration by a factor
      const animationDuration = routeDuration * 100; // Make animation faster for demo purposes
      const newProgress = Math.min(elapsedTime / animationDuration, 1);
      setProgress(newProgress);
      
      if (newProgress < 1) {
        // Get coordinate at the current progress point along the route
        const coordinates = route.geometry.coordinates;
        const pointIndex = Math.floor(newProgress * (coordinates.length - 1));
        
        if (marker.current && coordinates[pointIndex]) {
          // Update marker position
          marker.current.setLngLat(coordinates[pointIndex]);
          
          // Center map on current position with smooth animation
          map.current?.panTo(coordinates[pointIndex], { duration: 500 });
        }
        
        // Continue animation
        animationRef.current = requestAnimationFrame(animateRoute);
      } else {
        // Animation complete
        setProgress(1);
        if (marker.current && route.geometry.coordinates.length > 0) {
          // Set to final position
          const finalCoord = route.geometry.coordinates[route.geometry.coordinates.length - 1];
          marker.current.setLngLat(finalCoord);
        }
        toast.success('Simulação concluída!');
      }
    };
    
    // Start the animation loop
    animationRef.current = requestAnimationFrame(animateRoute);
  };

  const resetAnimation = () => {
    // Cancel current animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Reset marker to start position
    if (marker.current && route && route.geometry.coordinates.length > 0) {
      marker.current.setLngLat(route.geometry.coordinates[0]);
    }
    
    // Reset map view
    if (map.current && route) {
      const bounds = new mapboxgl.LngLatBounds();
      route.geometry.coordinates.forEach((coord: [number, number]) => {
        bounds.extend(coord);
      });
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 15 });
    }
    
    // Reset state
    setProgress(0);
    setAnimationStarted(false);
    startTimeRef.current = null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-10 z-50 grid w-full max-w-full mx-auto gap-4 border bg-background p-6 shadow-lg rounded-lg">
        <div className="flex flex-col h-full space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {loading ? 'Carregando...' : `Rastreamento da Ordem: ${order?.id?.substring(0, 8)}`}
            </h2>
            <Button variant="outline" onClick={onClose}>Fechar</Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-[500px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : mapError ? (
            <div className="flex flex-col justify-center items-center h-[500px] text-center">
              <p className="text-destructive text-lg mb-4">{mapError}</p>
              <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 h-full">
              <div className="h-[500px] relative border rounded-md overflow-hidden bg-gray-100">
                <div ref={mapContainer} className="absolute inset-0" />
                
                {/* Route info overlay */}
                {route && (
                  <div className="absolute top-4 right-4 bg-white p-3 rounded-md shadow-md z-10 max-w-xs">
                    <div className="flex flex-col space-y-2">
                      <div className="text-sm font-semibold flex justify-between">
                        <span>Distância:</span>
                        <span>{(routeDistance / 1000).toFixed(1)} km</span>
                      </div>
                      <div className="text-sm font-semibold flex justify-between">
                        <span>Tempo estimado:</span>
                        <span>{Math.floor(routeDuration / 60)} min</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                          style={{ width: `${progress * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {route && (
                <div className="flex justify-center gap-4">
                  {!animationStarted ? (
                    <Button onClick={startAnimation} className="gap-2">
                      <Navigation className="h-4 w-4" />
                      Iniciar Simulação
                    </Button>
                  ) : (
                    <Button onClick={resetAnimation} variant="outline" className="gap-2">
                      Reiniciar Simulação
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
