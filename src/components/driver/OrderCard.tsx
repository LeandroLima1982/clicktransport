
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle, XCircle, Car, Clock, Users, ArrowRight } from 'lucide-react';
import { formatDate, getStatusBadge } from './utils/formatters';
import OrderDetailSheet from './OrderDetailSheet';
import { ServiceOrder } from './hooks/useServiceOrders';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface OrderCardProps {
  order: ServiceOrder;
  driverId: string | null;
  handleAcceptOrder?: (orderId: string) => Promise<void>;
  handleRejectOrder?: (orderId: string) => Promise<void>;
  handleUpdateStatus: (orderId: string, newStatus: string) => Promise<void>;
  showActionButtons?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  driverId,
  handleAcceptOrder, 
  handleRejectOrder,
  handleUpdateStatus,
  showActionButtons = true
}) => {
  const isPending = order.status === 'pending' && !order.driver_id;
  const isAssigned = order.status === 'assigned' && order.driver_id === driverId;
  const isInProgress = order.status === 'in_progress' && order.driver_id === driverId;
  const isMobile = useIsMobile();
  
  // States for swipe functionality on mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  
  // Swipe threshold
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setSwiping(true);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    
    // Calculate and set swipe offset for visual feedback
    const offset = currentTouch - touchStart;
    // Limit the maximum swipe distance
    const maxOffset = 100;
    const limitedOffset = Math.max(-maxOffset, Math.min(maxOffset, offset));
    setSwipeOffset(limitedOffset);
  };
  
  const onTouchEnd = async () => {
    setSwiping(false);
    setSwipeOffset(0);
    
    if (!touchStart || !touchEnd) return;
    
    const distance = touchEnd - touchStart;
    const isLeftSwipe = distance < -minSwipeDistance;
    const isRightSwipe = distance > minSwipeDistance;
    
    if (isLeftSwipe && isPending && handleRejectOrder) {
      // Swipe left to reject
      try {
        await handleRejectOrder(order.id);
        playHapticFeedback('error');
        toast.error('Corrida rejeitada');
      } catch (error) {
        console.error('Erro ao rejeitar corrida:', error);
      }
    } else if (isRightSwipe && isPending && handleAcceptOrder) {
      // Swipe right to accept
      try {
        await handleAcceptOrder(order.id);
        playHapticFeedback('success');
        toast.success('Você aceitou esta corrida!');
      } catch (error) {
        console.error('Erro ao aceitar corrida:', error);
      }
    }
    
    // Reset touch values
    setTouchStart(null);
    setTouchEnd(null);
  };
  
  // Haptic feedback function (vibrate if available)
  const playHapticFeedback = (type: 'success' | 'error') => {
    if (navigator.vibrate) {
      if (type === 'success') {
        navigator.vibrate([100, 30, 100]);
      } else {
        navigator.vibrate(150);
      }
    }
  };

  const onAcceptOrder = async () => {
    if (handleAcceptOrder) {
      try {
        await handleAcceptOrder(order.id);
        playHapticFeedback('success');
        toast.success('Você aceitou esta corrida!');
      } catch (error) {
        console.error('Erro ao aceitar corrida:', error);
        toast.error('Não foi possível aceitar esta corrida');
      }
    }
  };

  const onRejectOrder = async () => {
    if (handleRejectOrder) {
      try {
        await handleRejectOrder(order.id);
        playHapticFeedback('error');
        toast.success('Corrida rejeitada');
      } catch (error) {
        console.error('Erro ao rejeitar corrida:', error);
        toast.error('Não foi possível rejeitar esta corrida');
      }
    }
  };

  const onUpdateStatus = async (newStatus: string) => {
    try {
      await handleUpdateStatus(order.id, newStatus);
      playHapticFeedback('success');
      const statusMessages = {
        'in_progress': 'Corrida iniciada!',
        'completed': 'Corrida finalizada com sucesso!',
        'cancelled': 'Corrida cancelada'
      };
      toast.success(statusMessages[newStatus as keyof typeof statusMessages] || 'Status atualizado');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Não foi possível atualizar o status');
    }
  };

  if (isMobile) {
    // App-like order card based on reference image
    return (
      <div 
        className="vehicle-card relative"
        style={{
          transform: swiping ? `translateX(${swipeOffset}px)` : 'translateX(0)',
          transition: swiping ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {isPending && (
          <>
            <div 
              className="absolute left-4 top-0 bottom-0 flex items-center justify-center opacity-0"
              style={{ opacity: swipeOffset > 30 ? Math.min(1, swipeOffset / 50) : 0 }}
            >
              <CheckCircle className="text-green-500 h-8 w-8" />
            </div>
            <div 
              className="absolute right-4 top-0 bottom-0 flex items-center justify-center opacity-0"
              style={{ opacity: swipeOffset < -30 ? Math.min(1, -swipeOffset / 50) : 0 }}
            >
              <XCircle className="text-red-500 h-8 w-8" />
            </div>
          </>
        )}
        
        <div className="vehicle-header">
          <div>
            <div className="text-xs text-white/60 mb-1">Ordem #{order.id.slice(0, 8)}</div>
            <div className="vehicle-name">{order.company_name}</div>
          </div>
          {getStatusBadge(order.status)}
        </div>
        
        <div className="journey-info">
          <div className="journey-location">
            <div className="location-dot origin"></div>
            <div className="location-text">
              <div className="location-name">{order.origin}</div>
              <div className="location-time">{formatDate(order.pickup_date)}</div>
            </div>
          </div>
          
          <div className="journey-location">
            <div className="location-dot destination"></div>
            <div className="location-text">
              <div className="location-name">{order.destination}</div>
            </div>
          </div>
          
          <div className="route-line"></div>
          
          <div className="journey-stats">
            <div className="stat">
              <Users className="h-4 w-4 text-[#F8D748]" />
              <span className="stat-value">4</span>
            </div>
            
            <div className="stat">
              <MapPin className="h-4 w-4 text-[#F8D748]" />
              <span className="stat-value">15 km</span>
            </div>
            
            <div className="stat">
              <Clock className="h-4 w-4 text-[#F8D748]" />
              <span className="stat-value">30 min</span>
            </div>
          </div>
          
          {showActionButtons && (
            <div className="flex gap-3 mt-4">
              {isPending && handleAcceptOrder && handleRejectOrder && (
                <>
                  <button 
                    className="action-btn flex-1 py-3"
                    onClick={onAcceptOrder}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Aceitar</span>
                  </button>
                  <button 
                    className="action-btn-secondary flex-1 py-3" 
                    onClick={onRejectOrder}
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Rejeitar</span>
                  </button>
                </>
              )}
              
              {isAssigned && (
                <button 
                  className="action-btn w-full py-3"
                  onClick={() => onUpdateStatus('in_progress')}
                >
                  <Car className="h-5 w-5 mr-2" />
                  <span className="font-medium">Iniciar Corrida</span>
                </button>
              )}
              
              {isInProgress && (
                <button 
                  className="action-btn w-full py-3"
                  onClick={() => onUpdateStatus('completed')}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">Finalizar Corrida</span>
                </button>
              )}
            </div>
          )}
          
          {(isAssigned || isInProgress) && (
            <div className="mt-3 text-center">
              <p className="text-xs text-white/70">
                {isAssigned ? 'Deslize para iniciar a viagem' : 'Deslize para finalizar a viagem'}
              </p>
              <ArrowRight className="h-4 w-4 text-[#F8D748] mx-auto mt-1 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Original card for desktop
  return (
    <Card key={order.id} className="overflow-hidden desktop-card">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold mb-2">Ordem #{order.id.slice(0, 8)}</h3>
                <p className="text-sm text-muted-foreground mb-1">Empresa: {order.company_name}</p>
                <p className="text-sm text-muted-foreground">Data: {formatDate(order.pickup_date)}</p>
              </div>
              {getStatusBadge(order.status)}
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Origem:</p>
                  <p className="font-medium">{order.origin}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Destino:</p>
                  <p className="font-medium">{order.destination}</p>
                </div>
              </div>
            </div>
          </div>
          
          {showActionButtons && (
            <div className="flex flex-col justify-end">
              <div className="space-y-2">
                {isPending && handleAcceptOrder && handleRejectOrder && (
                  <>
                    <Button 
                      className="w-full"
                      onClick={onAcceptOrder}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Aceitar Corrida
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={onRejectOrder}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Rejeitar
                    </Button>
                  </>
                )}
                
                {isAssigned && (
                  <Button 
                    className="w-full"
                    onClick={() => onUpdateStatus('in_progress')}
                  >
                    <Car className="mr-2 h-4 w-4" />
                    Iniciar Corrida
                  </Button>
                )}
                
                {isInProgress && (
                  <Button 
                    className="w-full"
                    variant="default" 
                    onClick={() => onUpdateStatus('completed')}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Finalizar Corrida
                  </Button>
                )}
                
                <OrderDetailSheet 
                  order={order} 
                  handleUpdateStatus={handleUpdateStatus} 
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
