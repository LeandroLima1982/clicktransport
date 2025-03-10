
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Loader2, Navigation, Map as MapIcon } from 'lucide-react';
import { ServiceOrder } from './types';
import { supabase } from '@/main';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MAPBOX_TOKEN } from '@/utils/mapbox';

// Define fallback style for static map image
const STATIC_MAP_STYLE = 'streets-v12';

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
  const [useStaticMap, setUseStaticMap] = useState(false);
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  const [staticMapUrl, setStaticMapUrl] = useState<string | null>(null);
  const [routeDistance, setRouteDistance] = useState(0);
  const [routeDuration, setRouteDuration] = useState(0);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isOpen, orderId]);

  // Initialize map or fetch coordinates for static map when order is available
  useEffect(() => {
    if (order && isOpen) {
      console.log("Order data available, preparing map:", order);
      getCoordinatesAndPrepareMap(order.origin, order.destination);
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

  const getCoordinatesAndPrepareMap = async (origin: string, destination: string) => {
    try {
      console.log("Getting coordinates for addresses");
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
      setOriginCoords(originCoords);
      setDestinationCoords(destinationCoords);
      
      // Try to initialize interactive map first
      try {
        await initializeMap(originCoords, destinationCoords);
      } catch (error) {
        console.error("Interactive map initialization failed, falling back to static map:", error);
        setUseStaticMap(true);
        prepareStaticMap(originCoords, destinationCoords);
      }
      
      // Get route data for display even if using static map
      fetchRouteData(originCoords, destinationCoords);
    } catch (error) {
      console.error("Error in map preparation:", error);
      setMapError('Erro ao preparar o mapa. Tente novamente.');
    }
  };

  const prepareStaticMap = (start: [number, number], end: [number, number]) => {
    // Create static map URL with markers for origin and destination
    const token = MAPBOX_TOKEN;
    if (!token) {
      setMapError('Chave de API do Mapbox não encontrada');
      return;
    }
    
    const url = new URL('https://api.mapbox.com/styles/v1/mapbox/' + STATIC_MAP_STYLE + '/static/');
    
    // Add a line between start and end points
    url.pathname += `path-5+3887be(${start[0]},${start[1]};${end[0]},${end[1]})/`;
    
    // Add markers
    const originMarker = `pin-s-a+00FF00(${start[0]},${start[1]})`;
    const destMarker = `pin-s-b+FF0000(${end[0]},${end[1]})`;
    url.pathname += `${originMarker},${destMarker}/`;
    
    // Create a bounding box that includes both points with some padding
    const lngMin = Math.min(start[0], end[0]);
    const lngMax = Math.max(start[0], end[0]);
    const latMin = Math.min(start[1], end[1]);
    const latMax = Math.max(start[1], end[1]);
    
    // Add padding to the bounding box
    const padding = 0.1;
    const bounds = [
      lngMin - padding,
      latMin - padding,
      lngMax + padding,
      latMax + padding
    ].join(',');
    
    // Add bounds and other parameters
    url.pathname += `${bounds}/`;
    url.pathname += '800x500@2x';  // width x height @retina
    
    // Add access token
    url.search = `access_token=${token}`;
    
    setStaticMapUrl(url.toString());
    console.log("Generated static map URL:", url.toString());
  };

  const initializeMap = async (start: [number, number], end: [number, number]) => {
    if (!mapContainer.current) {
      console.error("Map container ref is not available");
      throw new Error('Elemento do mapa não encontrado');
    }

    // Use MAPBOX_TOKEN from utils/mapbox
    const token = MAPBOX_TOKEN;
    if (!token) {
      console.error("Mapbox token is missing");
      throw new Error('Token do Mapbox não encontrado');
    }
    
    console.log("Initializing interactive map with Mapbox token");
    
    // Apply explicit styling to ensure map container is visible
    if (mapContainer.current) {
      mapContainer.current.style.minHeight = '400px';
      mapContainer.current.style.height = '100%';
      mapContainer.current.style.width = '100%';
      mapContainer.current.style.backgroundColor = '#e9e9e9';
    }
    
    // Initialize Mapbox
    mapboxgl.accessToken = token;
    
    // Clear any existing map instance
    if (map.current) {
      map.current.remove();
    }
    
    // Create new map instance with error handling
    return new Promise<void>((resolve, reject) => {
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/streets-v12',
          zoom: 12,
          minZoom: 2,
          fadeDuration: 0, // Disable fade animations to help with rendering
          renderWorldCopies: false, // Disable rendering multiple copies of world to reduce load
          attributionControl: false, // Disable attribution to simplify the map
        });

        // Add error handler for initialization
        map.current.on('error', (e) => {
          console.error('Mapbox error event:', e);
          reject(new Error('Falha ao inicializar o mapa: ' + e.error?.message || 'Erro desconhecido'));
        });

        // Handle successful map load
        map.current.on('load', () => {
          if (!map.current) {
            reject(new Error('Instância do mapa não está disponível após o carregamento'));
            return;
          }
          
          try {
            console.log("Map loaded successfully, adding markers");
            
            // Add origin and destination markers
            new mapboxgl.Marker({ color: '#00FF00' })
              .setLngLat(start)
              .setPopup(new mapboxgl.Popup().setHTML(`<h3>Origem</h3><p>${order?.origin || 'Origem'}</p>`))
              .addTo(map.current);
            
            new mapboxgl.Marker({ color: '#FF0000' })
              .setLngLat(end)
              .setPopup(new mapboxgl.Popup().setHTML(`<h3>Destino</h3><p>${order?.destination || 'Destino'}</p>`))
              .addTo(map.current);
            
            // Create marker for the vehicle
            marker.current = new mapboxgl.Marker({ color: '#3FB1CE' })
              .setLngLat(start)
              .addTo(map.current);
            
            // Set bounds to include both markers
            const bounds = new mapboxgl.LngLatBounds()
              .extend(start)
              .extend(end);
            
            map.current.fitBounds(bounds, { padding: 60, maxZoom: 15 });
            
            resolve();
          } catch (error) {
            console.error('Error setting up map markers:', error);
            reject(error);
          }
        });
      } catch (error) {
        console.error('Error creating Mapbox instance:', error);
        reject(error);
      }
    });
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

  const fetchRouteData = async (start: [number, number], end: [number, number]) => {
    const token = MAPBOX_TOKEN;
    if (!token) return;
    
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
        const route = data.routes[0];
        
        // Add route to map if interactive map is available
        if (!useStaticMap && map.current && route) {
          try {
            console.log("Adding route to interactive map");
            
            // Add route to map
            if (!map.current.getSource('route')) {
              map.current.addSource('route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: route.geometry
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
          } catch (error) {
            console.error("Error adding route to map:", error);
          }
        }
        
        // Calculate route details
        if (route.legs && route.legs.length > 0) {
          const leg = route.legs[0];
          setRouteDistance(leg.distance);
          setRouteDuration(leg.duration);
        }
      }
    } catch (error) {
      console.error('Error getting route:', error);
    }
  };

  const handleRetry = () => {
    // Reset error state
    setMapError(null);
    
    // If we have coordinates, try to initialize the map again
    if (originCoords && destinationCoords) {
      if (useStaticMap) {
        // If we were using static map, try interactive again
        setUseStaticMap(false);
        try {
          initializeMap(originCoords, destinationCoords).catch(() => {
            // If interactive map fails again, go back to static map
            setUseStaticMap(true);
          });
        } catch {
          setUseStaticMap(true);
        }
      } else {
        // If we were using interactive map, try to refetch order and reinitialize
        fetchOrderDetails();
      }
    } else {
      // If we don't have coordinates, refetch everything
      fetchOrderDetails();
    }
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
              <Button onClick={handleRetry}>Tentar novamente</Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 h-full">
              <div className="h-[500px] relative border rounded-md overflow-hidden bg-gray-100">
                {useStaticMap ? (
                  /* Static map fallback */
                  staticMapUrl ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <img 
                        src={staticMapUrl} 
                        alt="Mapa da rota" 
                        className="max-w-full max-h-full object-contain" 
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-100">
                      <p>Carregando mapa estático...</p>
                    </div>
                  )
                ) : (
                  /* Interactive map */
                  <div 
                    ref={mapContainer} 
                    className="absolute inset-0" 
                    style={{ minHeight: "400px", backgroundColor: "#e9e9e9" }}
                  />
                )}
                
                {/* Route info overlay - show for both map types */}
                {(routeDistance > 0 || routeDuration > 0) && (
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
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center gap-4">
                <Button onClick={handleRetry} variant="outline" className="gap-2">
                  {useStaticMap ? (
                    <>
                      <MapIcon className="h-4 w-4" />
                      Tentar mapa interativo
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-4 w-4" />
                      Recarregar mapa
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
