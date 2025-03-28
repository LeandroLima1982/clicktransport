
import React, { useState, useEffect, useCallback } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import TransitionEffect from '@/components/TransitionEffect';
import DriverSidebar from '@/components/driver/DriverSidebar';
import DriverHeader from '@/components/driver/DriverHeader';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, AlertTriangle, Check, MapIcon, Clock, Timer } from 'lucide-react';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import { useServiceOrderSubscription } from '@/hooks/driver/useServiceOrderSubscription';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import DriverMap from '@/components/driver/DriverMap';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DriverNavigation: React.FC = () => {
  const { user } = useAuth();
  const [driverId, setDriverId] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<any | null>(null);
  const [isLoadingDriver, setIsLoadingDriver] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [eta, setEta] = useState<number | null>(null);
  const [tripStarted, setTripStarted] = useState(false);
  const [tripStartTime, setTripStartTime] = useState<Date | null>(null);

  // Initialize location tracking
  const {
    location,
    error: locationError,
    isTracking,
    lastUpdateTime,
    startTracking,
    stopTracking,
    updateNow
  } = useDriverLocation(driverId, currentOrderId, {
    updateInterval: 15000 // Update every 15 seconds
  });

  // Handle service order notifications
  const handleOrderNotification = useCallback((payload: any) => {
    console.log('Order notification:', payload);
    
    // Handle trip started event
    if (payload.eventName === 'trip_started') {
      setTripStarted(true);
      setTripStartTime(new Date());
      toast.success('Viagem iniciada!', {
        description: 'O sistema está agora rastreando sua localização em tempo real'
      });
    }
    
    // Refresh order details when relevant
    if (payload.eventName !== 'location_update') {
      fetchCurrentOrder();
    }
  }, []);

  // Subscribe to order updates
  useServiceOrderSubscription(driverId, handleOrderNotification);

  // Fetch driver ID when component mounts
  useEffect(() => {
    if (user) {
      fetchDriverId();
    }
  }, [user]);

  // Fetch current order when driver ID is available
  useEffect(() => {
    if (driverId) {
      fetchCurrentOrder();
      
      // Subscribe to order changes for this driver
      const channel = supabase
        .channel('driver_orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'service_orders',
            filter: `driver_id=eq.${driverId} AND status=in.('assigned','in_progress')`
          },
          (payload) => {
            console.log('Order update received:', payload);
            
            // Check if trip was just started
            if (payload.new.status === 'in_progress' && payload.old.status !== 'in_progress') {
              setTripStarted(true);
              setTripStartTime(new Date());
            }
            
            fetchCurrentOrder();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [driverId]);

  // Start/stop tracking based on whether there's an active order
  useEffect(() => {
    if (driverId && currentOrderId) {
      if (!isTracking) {
        startTracking();
        toast.success('Rastreamento de localização iniciado', {
          description: 'Sua localização está sendo compartilhada para esta corrida.'
        });
      }
    } else {
      if (isTracking) {
        stopTracking();
      }
    }
  }, [driverId, currentOrderId, isTracking, startTracking, stopTracking]);

  const fetchDriverId = async () => {
    setIsLoadingDriver(true);
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Erro ao buscar ID do motorista:', error);
        toast.error('Erro ao buscar perfil do motorista');
        return;
      }

      if (data) {
        setDriverId(data.id);
        console.log('ID do motorista encontrado:', data.id);
      } else {
        toast.error('Perfil de motorista não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar ID do motorista:', error);
      toast.error('Erro ao carregar perfil do motorista');
    } finally {
      setIsLoadingDriver(false);
    }
  };

  const fetchCurrentOrder = async () => {
    if (!driverId) return;
    
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          companies:company_id (name)
        `)
        .eq('driver_id', driverId)
        .in('status', ['assigned', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // No rows returned
          console.error('Error fetching current order:', error);
        }
        setCurrentOrderId(null);
        setCurrentOrder(null);
        setTripStarted(false);
        setTripStartTime(null);
        return;
      }

      if (data) {
        setCurrentOrderId(data.id);
        setCurrentOrder(data);
        
        // If status is already in_progress, update trip started state
        if (data.status === 'in_progress') {
          setTripStarted(true);
          // Set trip start time if not already set
          if (!tripStartTime) {
            setTripStartTime(new Date());
          }
        }
      }
    } catch (error) {
      console.error('Exception fetching current order:', error);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!currentOrderId) return;
    
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ 
          status: newStatus,
          ...(newStatus === 'in_progress' ? { start_time: new Date().toISOString() } : {}),
          ...(newStatus === 'completed' ? { end_time: new Date().toISOString() } : {})
        })
        .eq('id', currentOrderId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      if (newStatus === 'in_progress') {
        setTripStarted(true);
        setTripStartTime(new Date());
        toast.success('Viagem iniciada!');
      } else if (newStatus === 'completed') {
        toast.success('Viagem finalizada com sucesso!');
      }
      
      fetchCurrentOrder();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erro ao atualizar status da ordem');
    }
  };

  const handleForceUpdate = () => {
    updateNow();
    toast.success('Localização atualizada');
  };
  
  const handleEtaUpdate = (etaSeconds: number) => {
    setEta(etaSeconds);
  };

  const formatEta = () => {
    if (eta === null) return 'Calculando...';
    
    const minutes = Math.floor(eta / 60);
    const seconds = Math.floor(eta % 60);
    
    if (minutes > 0) {
      return `${minutes}min ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const renderTrackingStatus = () => {
    if (locationError) {
      return (
        <div className="flex items-center text-destructive gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Erro no rastreamento: {locationError.message}</span>
        </div>
      );
    }
    
    if (isTracking && location) {
      return (
        <div className="flex items-center text-green-600 gap-2">
          <Check className="h-4 w-4" />
          <span>
            Rastreamento ativo
            {lastUpdateTime && ` (Atualizado: ${lastUpdateTime.toLocaleTimeString()})`}
          </span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-orange-500 gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>Rastreamento não iniciado</span>
      </div>
    );
  };

  const toggleMap = () => {
    setShowMap(!showMap);
  };
  
  const renderElapsedTime = () => {
    if (!tripStarted || !tripStartTime) return null;
    
    const now = new Date();
    const diffMs = now.getTime() - tripStartTime.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    
    return (
      <div className="flex items-center gap-2 text-primary font-medium">
        <Timer className="h-4 w-4" />
        <span>Tempo de viagem: {minutes}min {seconds}s</span>
      </div>
    );
  };

  return (
    <TransitionEffect>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DriverSidebar />
          
          <div className="flex-1 flex flex-col">
            <DriverHeader />
            
            <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
              <div className="mb-6 space-y-2">
                <h1 className="text-2xl font-bold">Navegação</h1>
                <p className="text-muted-foreground">Acompanhe suas rotas e destinos</p>
              </div>
              
              {currentOrder ? (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="mb-4 flex justify-between items-start">
                        <div>
                          <h2 className="text-lg font-semibold mb-1">
                            Corrida Atual: {currentOrder.id.substring(0, 8)}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {currentOrder.companies?.name}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          currentOrder.status === 'in_progress' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {currentOrder.status === 'assigned' ? 'Aguardando início' : 'Em andamento'}
                        </span>
                      </div>
                      
                      {tripStarted && tripStartTime && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-4 flex flex-col gap-1">
                          <div className="font-medium">Status da Viagem</div>
                          {renderElapsedTime()}
                          {eta !== null && (
                            <div className="flex items-center gap-2 text-primary">
                              <Clock className="h-4 w-4" />
                              <span>Chegada estimada: {formatEta()}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex gap-3 items-start">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Origem</p>
                            <p className="font-medium">{currentOrder.origin}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 items-start">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Navigation className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Destino</p>
                            <p className="font-medium">{currentOrder.destination}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 items-start">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Data</p>
                            <p className="font-medium">
                              {format(new Date(currentOrder.pickup_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">Status de Rastreamento</h3>
                          <Button variant="outline" size="sm" onClick={handleForceUpdate}>
                            Atualizar agora
                          </Button>
                        </div>
                        
                        {renderTrackingStatus()}
                        
                        {location && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Coordenadas: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                            {location.coords.heading && ` | Direção: ${location.coords.heading.toFixed(1)}°`}
                            {location.coords.speed && ` | Velocidade: ${(location.coords.speed * 3.6).toFixed(1)} km/h`}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-3">
                        {currentOrder.status === 'assigned' && (
                          <Button 
                            onClick={() => updateOrderStatus('in_progress')}
                            className="flex-1"
                          >
                            Iniciar Corrida
                          </Button>
                        )}
                        
                        {currentOrder.status === 'in_progress' && (
                          <Button 
                            onClick={() => updateOrderStatus('completed')}
                            className="flex-1"
                          >
                            Finalizar Corrida
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          onClick={toggleMap}
                          className="flex items-center gap-2"
                        >
                          <MapIcon className="h-4 w-4" />
                          {showMap ? 'Ocultar Mapa' : 'Mostrar Mapa'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {showMap && (
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="font-medium mb-4">Mapa de Navegação</h3>
                        <div className="h-[400px] bg-gray-100 rounded-lg overflow-hidden">
                          <DriverMap 
                            currentOrder={currentOrder}
                            currentLocation={location ? 
                              [location.coords.longitude, location.coords.latitude] : 
                              undefined
                            }
                            heading={location?.coords.heading}
                            onEtaUpdate={handleEtaUpdate}
                          />
                        </div>
                        
                        {eta !== null && (
                          <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                            <p className="text-sm font-medium">Tempo estimado até o destino: <span className="text-primary">{formatEta()}</span></p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 mx-auto mb-4" />
                        <p>Nenhuma rota ativa no momento</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TransitionEffect>
  );
};

export default DriverNavigation;
