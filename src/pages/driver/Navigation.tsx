import React, { useState, useEffect } from 'react';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import TransitionEffect from '@/components/TransitionEffect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation as NavigationIcon, Flag, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useServiceOrderSubscription, ServiceOrderNotificationPayload } from '@/hooks/driver/useServiceOrderSubscription';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { logInfo } from '@/services/monitoring/systemLogService';
import { formatDate } from '@/components/driver/utils/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { submitRating } from '@/services/rating/ratingService';
import { StarRating } from '@/components/ui/star-rating';
import { Textarea } from '@/components/ui/textarea';
import { updateServiceOrderStatus } from '@/services/booking/bookingService';
import { ServiceOrder } from '@/types/serviceOrder';

const Navigation: React.FC = () => {
  const { user } = useAuth();
  const [driverId, setDriverId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentOrder, setCurrentOrder] = useState<ServiceOrder | null>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  
  const { location, startTracking, stopTracking } = useDriverLocation(driverId);

  useEffect(() => {
    if (user) {
      fetchDriverId();
    }
  }, [user]);

  // Subscribe to service order updates
  useServiceOrderSubscription({
    driverId, 
    onNotification: (payload: ServiceOrderNotificationPayload) => {
      console.log("Received notification for order:", payload);
      // If there's a status update for the current order, refresh the order data
      if (payload.id === currentOrder?.id && payload.status) {
        fetchCurrentOrder(driverId!);
      }
    }
  });

  const fetchDriverId = async () => {
    setIsLoading(true);
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
        fetchCurrentOrder(data.id);
      } else {
        toast.error('Perfil de motorista não encontrado');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Erro ao buscar ID do motorista:', error);
      toast.error('Erro ao carregar perfil do motorista');
      setIsLoading(false);
    }
  };

  const fetchCurrentOrder = async (driverId: string) => {
    if (!driverId) return;
    
    setIsLoading(true);
    try {
      // Look for active orders (in_progress or assigned)
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('driver_id', driverId)
        .in('status', ['in_progress', 'assigned'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No order found, this is expected sometimes
          console.log('No active order found');
          setCurrentOrder(null);
        } else {
          console.error('Erro ao buscar ordem atual:', error);
          toast.error('Erro ao carregar informações da viagem');
        }
      } else {
        console.log('Current order found:', data);
        // Type assertion to ensure the data matches ServiceOrder type
        setCurrentOrder(data as ServiceOrder);
        
        // Start tracking location
        if (data.status === 'in_progress') {
          startTracking(data.id);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar ordem atual:', error);
      toast.error('Erro ao carregar informações da viagem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTrip = async () => {
    if (!currentOrder) return;
    
    try {
      const { error } = await updateServiceOrderStatus(currentOrder.id, 'in_progress');
      
      if (error) throw error;
      
      // Start location tracking
      startTracking(currentOrder.id);
      
      toast.success('Viagem iniciada!');
      
      // Update the current order status locally
      setCurrentOrder(prev => prev ? {...prev, status: 'in_progress'} : null);
      
      logInfo(
        `Driver started trip for order ${currentOrder.id}`,
        'driver',
        { driver_id: driverId, order_id: currentOrder.id }
      );
    } catch (error) {
      console.error('Error starting trip:', error);
      toast.error('Erro ao iniciar viagem. Tente novamente.');
    }
  };

  const handleCompleteTrip = () => {
    setShowCompletionDialog(true);
  };

  const confirmTripCompletion = async () => {
    if (!currentOrder) return;
    
    try {
      const { error } = await updateServiceOrderStatus(currentOrder.id, 'completed');
      
      if (error) throw error;
      
      // Stop location tracking
      stopTracking();
      
      toast.success('Viagem concluída com sucesso!');
      
      logInfo(
        `Driver completed trip for order ${currentOrder.id}`,
        'driver',
        { 
          driver_id: driverId, 
          order_id: currentOrder.id,
          origin: currentOrder.origin,
          destination: currentOrder.destination,
          duration: currentOrder.pickup_date 
            ? Math.round((new Date().getTime() - new Date(currentOrder.pickup_date).getTime()) / 60000) 
            : 'unknown'
        }
      );
      
      // Open rating dialog
      setShowCompletionDialog(false);
      setShowRatingDialog(true);
      
      // Refresh current order data
      fetchCurrentOrder(driverId!);
      
    } catch (error) {
      console.error('Error completing trip:', error);
      toast.error('Erro ao finalizar viagem. Tente novamente.');
      setShowCompletionDialog(false);
    }
  };

  const handleRatingSubmitted = async () => {
    if (!currentOrder || !driverId) return;
    
    try {
      const ratingData = {
        order_id: currentOrder.id,
        driver_id: driverId,
        rating,
        feedback: feedback || undefined
      };
      
      const success = await submitRating(ratingData);
      
      if (success) {
        toast.success('Avaliação enviada com sucesso!');
        setRatingSubmitted(true);
        setShowRatingDialog(false);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Erro ao enviar avaliação');
    }
  };

  return (
    <TransitionEffect>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Navegação</h1>
        
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-full mb-3" />
              <Skeleton className="h-6 w-5/6 mb-3" />
              <Skeleton className="h-6 w-4/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ) : currentOrder ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Viagem Atual</span>
                  <Badge variant={currentOrder.status === 'in_progress' ? 'default' : 'secondary'}>
                    {currentOrder.status === 'in_progress' ? 'Em andamento' : 'Atribuída'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-green-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="font-medium">Origem:</span>
                  </div>
                  <p className="pl-7">{currentOrder.origin}</p>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-red-500">
                    <Flag className="h-5 w-5 mr-2" />
                    <span className="font-medium">Destino:</span>
                  </div>
                  <p className="pl-7">{currentOrder.destination}</p>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <span className="font-medium mr-2">Data de coleta:</span>
                  <span>{formatDate(currentOrder.pickup_date)}</span>
                </div>
                
                {currentOrder.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-700">Observações:</p>
                    <p className="text-sm text-gray-600">{currentOrder.notes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {currentOrder.status === 'assigned' ? (
                  <Button 
                    className="w-full" 
                    onClick={handleStartTrip}
                  >
                    <NavigationIcon className="mr-2 h-4 w-4" />
                    Iniciar Viagem
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={handleCompleteTrip}
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    Concluir Viagem
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            {location && (
              <Card>
                <CardHeader>
                  <CardTitle>Sua Localização Atual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Latitude</p>
                      <p className="font-mono">{location.coords.latitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Longitude</p>
                      <p className="font-mono">{location.coords.longitude.toFixed(6)}</p>
                    </div>
                    {location.coords.heading && (
                      <div>
                        <p className="text-sm text-gray-500">Direção</p>
                        <p className="font-mono">{location.coords.heading.toFixed(1)}°</p>
                      </div>
                    )}
                    {location.coords.speed && (
                      <div>
                        <p className="text-sm text-gray-500">Velocidade</p>
                        <p className="font-mono">{(location.coords.speed * 3.6).toFixed(1)} km/h</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Nenhuma viagem em andamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Você não possui nenhuma viagem em andamento no momento. 
                As novas atribuições aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Trip Completion Confirmation Dialog */}
        <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar conclusão da viagem</DialogTitle>
              <DialogDescription>
                Você está prestes a finalizar esta viagem. Isso indicará que você chegou ao destino
                e concluiu o serviço.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <h3 className="font-medium text-sm mb-2">Detalhes da viagem:</h3>
              {currentOrder && (
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Origem:</span> {currentOrder.origin}</p>
                  <p><span className="font-medium">Destino:</span> {currentOrder.destination}</p>
                  <p><span className="font-medium">Data:</span> {formatDate(currentOrder.pickup_date)}</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowCompletionDialog(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmTripCompletion}
              >
                Confirmar Conclusão
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Rating Dialog */}
        <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Como foi sua experiência?</DialogTitle>
              <DialogDescription>
                Avalie sua experiência com esta viagem para nos ajudar a melhorar nossos serviços.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="flex flex-col items-center space-y-2">
                <p className="text-sm font-medium">Sua avaliação</p>
                <StarRating 
                  initialRating={rating} 
                  onChange={setRating} 
                  size="lg" 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="feedback" className="text-sm font-medium">
                  Comentários (opcional)
                </label>
                <Textarea 
                  id="feedback" 
                  placeholder="Compartilhe seus comentários sobre esta viagem..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowRatingDialog(false)}
              >
                Pular
              </Button>
              <Button 
                onClick={handleRatingSubmitted}
                disabled={ratingSubmitted}
              >
                {ratingSubmitted ? 'Enviado' : 'Enviar Avaliação'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TransitionEffect>
  );
};

export default Navigation;
