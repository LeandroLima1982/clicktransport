
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ServiceOrder } from './types';
import { supabase } from '@/main';
import { validateMapboxToken, getCoordinatesFromAddress, fetchRouteData, createStaticMapUrl } from './map/mapUtils';
import LoadingState from './map/LoadingState';
import ErrorState from './map/ErrorState';
import MapContainer from './map/MapContainer';

interface OrderTrackingProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, isOpen, onClose }) => {
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [useStaticMap, setUseStaticMap] = useState(false);
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  const [staticMapUrl, setStaticMapUrl] = useState<string | null>(null);
  const [routeDistance, setRouteDistance] = useState(0);
  const [routeDuration, setRouteDuration] = useState(0);
  const [routeGeometry, setRouteGeometry] = useState<any>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
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
      if (!validateMapboxToken()) {
        return;
      }
      
      // Get coordinates from addresses
      const [originCoordinates, destinationCoordinates] = await Promise.all([
        getCoordinatesFromAddress(origin),
        getCoordinatesFromAddress(destination)
      ]);
      
      if (!originCoordinates || !destinationCoordinates) {
        console.error("Could not get coordinates for addresses", { origin, destination });
        setMapError('Não foi possível obter coordenadas dos endereços fornecidos.');
        return;
      }
      
      console.log("Got coordinates", { originCoordinates, destinationCoordinates });
      setOriginCoords(originCoordinates);
      setDestinationCoords(destinationCoordinates);
      
      // Try to initialize interactive map first
      try {
        setUseStaticMap(false);
        
        // Get route data for display
        const routeData = await fetchRouteData(originCoordinates, destinationCoordinates);
        if (routeData) {
          setRouteGeometry(routeData.geometry);
          setRouteDistance(routeData.distance);
          setRouteDuration(routeData.duration);
        }
      } catch (error) {
        console.error("Interactive map initialization failed, falling back to static map:", error);
        setUseStaticMap(true);
        
        // Create static map URL
        const staticUrl = createStaticMapUrl(originCoordinates, destinationCoordinates);
        setStaticMapUrl(staticUrl);
        
        // Get route data even with static map
        const routeData = await fetchRouteData(originCoordinates, destinationCoordinates);
        if (routeData) {
          setRouteGeometry(routeData.geometry);
          setRouteDistance(routeData.distance);
          setRouteDuration(routeData.duration);
        }
      }
    } catch (error) {
      console.error("Error in map preparation:", error);
      setMapError('Erro ao preparar o mapa. Tente novamente.');
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
        
        // Create static map URL as fallback
        const staticUrl = createStaticMapUrl(originCoords, destinationCoords);
        setStaticMapUrl(staticUrl);
      } else {
        // If we were using interactive map, try to refetch order and reinitialize
        fetchOrderDetails();
      }
    } else {
      // If we don't have coordinates, refetch everything
      fetchOrderDetails();
    }
  };

  const handleToggleMapType = () => {
    if (originCoords && destinationCoords) {
      setUseStaticMap(!useStaticMap);
      
      if (useStaticMap) {
        // If switching to interactive map, ensure we have a static fallback
        const staticUrl = createStaticMapUrl(originCoords, destinationCoords);
        setStaticMapUrl(staticUrl);
      }
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
            <LoadingState />
          ) : mapError ? (
            <ErrorState message={mapError} onRetry={handleRetry} />
          ) : originCoords && destinationCoords ? (
            <MapContainer 
              orderId={orderId}
              originCoords={originCoords}
              destinationCoords={destinationCoords}
              useStaticMap={useStaticMap}
              staticMapUrl={staticMapUrl}
              routeGeometry={routeGeometry}
              routeDistance={routeDistance}
              routeDuration={routeDuration}
              originAddress={order?.origin}
              destinationAddress={order?.destination}
              onToggleMapType={handleToggleMapType}
            />
          ) : (
            <ErrorState 
              message="Não foi possível carregar as coordenadas do mapa." 
              onRetry={handleRetry} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
