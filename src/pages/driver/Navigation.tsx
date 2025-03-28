import React, { useState, useEffect, useCallback } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import TransitionEffect from '@/components/TransitionEffect';
import DriverSidebar from '@/components/driver/DriverSidebar';
import DriverHeader from '@/components/driver/DriverHeader';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, AlertTriangle, Check, MapIcon, Clock, Timer, CheckCircle } from 'lucide-react';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import { useServiceOrderSubscription, ServiceOrderNotificationPayload } from '@/hooks/driver/useServiceOrderSubscription';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import DriverMap from '@/components/driver/DriverMap';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RatingDialog from '@/components/driver/RatingDialog';

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
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [tripSummary, setTripSummary] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<ServiceOrder | null>(null);

  const {
    location,
    error: locationError,
    isTracking,
    lastUpdateTime,
    startTracking,
    stopTracking,
    updateNow
  } = useDriverLocation(driverId, currentOrderId, {
    updateInterval: 15000
  });

  const handleOrderNotification = useCallback((payload: ServiceOrderNotificationPayload) => {
    console.log('Order notification:', payload);
    
    if (payload.eventName === 'trip_started') {
      setTripStarted(true);
      setTripStartTime(new Date());
      toast.success('Viagem iniciada!', {
        description: 'O sistema está agora rastreando sua localização em tempo real'
      });
    }
    
    if (payload.eventName === 'trip_completed') {
      setCompletedOrder(payload.new as ServiceOrder);
      setTimeout(() => {
        setShowRatingDialog(true);
      }, 1000);
    }
    
    if (payload.eventName !== 'location_update') {
      fetchCurrentOrder();
    }
  }, []);

  useServiceOrderSubscription(driverId, handleOrderNotification);

  useEffect(() => {
    if (user) {
      fetchDriverId();
    }
  }, [user]);

  useEffect(() => {
    if (driverId) {
      fetchCurrentOrder();
      
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
          (payload: any) => {
            console.log('Order update received:', payload);
            
            if (payload.new && payload.old && 
                payload.new.status === 'in_progress' && 
                payload.old.status !== 'in_progress') {
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
        if (error.code !== 'PGRST116') {
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
        
        if (data.status === 'in_progress') {
          setTripStarted(true);
          if (!tripStartTime) {
            setTripStartTime(new Date());
          }
        }
      }
    } catch (error) {
      console.error('Exception fetching current order:', error);
    }
  };

  const calculateTripSummary = () => {
    if (!currentOrder || !tripStartTime) return null;
    
    const now = new Date();
    const tripDuration = Math.floor((now.getTime() - tripStartTime.getTime()) / 60000);
    
    const estimatedDistance = Math.round((tripDuration / 60) * 40);
    
    return {
      orderId: currentOrder.id,
      origin: currentOrder.origin,
      destination: currentOrder.destination,
      company: currentOrder.companies?.name || 'Empresa',
      startTime: tripStartTime,
      endTime: now,
      duration: tripDuration,
      distance: estimatedDistance,
    };
  };

  const handleFinishTrip = () => {
    const summary = calculateTripSummary();
    setTripSummary(summary);
    setShowCompletionDialog(true);
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!currentOrderId) return;
    
    try {
      setIsSubmitting(true);
      
      const currentPosition = location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      } : null;
      
      const tripEndTime = new Date();
      const tripDuration = tripStartTime 
        ? Math.floor((tripEndTime.getTime() - tripStartTime.getTime()) / 60000) 
        : 0;
      
      const { error } = await supabase
        .from('service_orders')
        .update({ 
          status: newStatus,
          delivery_date: tripEndTime.toISOString(),
          end_time: tripEndTime.toISOString(),
          trip_duration_minutes: tripDuration,
          end_location: currentPosition ? `${currentPosition.latitude},${currentPosition.longitude}` : null,
          completion_notes: `Viagem finalizada pelo motorista. Duração: ${tripDuration} minutos.`
        })
        .eq('id', currentOrderId);
      
      if (error) {
        throw error;
      }
      
      if (driverId) {
        await supabase
          .from('drivers')
          .update({ status: 'available' })
          .eq('id', driverId);
      }
      
      await supabase
        .from('system_logs')
        .insert({
          message: `Corrida concluída: ${currentOrderId}`,
          category: 'trip',
          severity: 'info',
          details: {
            driver_id: driverId,
            order_id: currentOrderId,
            duration: tripDuration,
            trip_summary: tripSummary
          }
        });
      
      stopTracking();
      
      toast.success('Viagem finalizada com sucesso!', {
        description: `Duração total: ${tripDuration} minutos`
      });
      
      setShowCompletionDialog(false);
      fetchCurrentOrder();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erro ao finalizar a viagem');
    } finally {
      setIsSubmitting(false);
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

  const formatDateTime = (date: Date) => {
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
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
                            onClick={handleFinishTrip}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
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
      
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Resumo da Viagem</DialogTitle>
            <DialogDescription>
              Confira os detalhes e confirme a finalização da corrida.
            </DialogDescription>
          </DialogHeader>
          
          {tripSummary && (
            <div className="space-y-5 py-2">
              <div className="space-y-1.5">
                <h3 className="font-semibold text-sm">Informações da Corrida</h3>
                <div className="text-sm grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">Empresa:</div>
                  <div>{tripSummary.company}</div>
                  <div className="text-muted-foreground">Referência:</div>
                  <div>#{tripSummary.orderId.substring(0, 8)}</div>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <h3 className="font-semibold text-sm">Trajeto</h3>
                <div className="text-sm grid grid-cols-1 gap-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-green-600" />
                    </div>
                    <div className="text-muted-foreground">De:</div>
                    <div className="flex-1">{tripSummary.origin}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-red-600" />
                    </div>
                    <div className="text-muted-foreground">Para:</div>
                    <div className="flex-1">{tripSummary.destination}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <h3 className="font-semibold text-sm">Período</h3>
                <div className="text-sm grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">Início:</div>
                  <div>{formatDateTime(tripSummary.startTime)}</div>
                  <div className="text-muted-foreground">Fim:</div>
                  <div>{formatDateTime(tripSummary.endTime)}</div>
                  <div className="text-muted-foreground">Duração:</div>
                  <div>{tripSummary.duration} minutos</div>
                </div>
              </div>
              
              <div className="rounded-md bg-primary-foreground p-3 space-y-1.5">
                <h3 className="font-semibold text-sm">Métricas da Viagem</h3>
                <div className="text-sm grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">Distância estimada:</div>
                  <div className="font-semibold">{tripSummary.distance} km</div>
                  <div className="text-muted-foreground">Tempo total:</div>
                  <div className="font-semibold">{tripSummary.duration} minutos</div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCompletionDialog(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => updateOrderStatus('completed')}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">◌</span>
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Conclusão
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <RatingDialog
        order={completedOrder}
        isOpen={showRatingDialog}
        onClose={() => setShowRatingDialog(false)}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </TransitionEffect>
  );
};

export default DriverNavigation;
