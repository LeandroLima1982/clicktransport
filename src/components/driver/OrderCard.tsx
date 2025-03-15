
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle, XCircle, Car, Clock, Users } from 'lucide-react';
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

  const onAcceptOrder = async () => {
    if (handleAcceptOrder) {
      try {
        await handleAcceptOrder(order.id);
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
      <div className="vehicle-card">
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
                  <button className="action-btn flex-1" onClick={onAcceptOrder}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Aceitar</span>
                  </button>
                  <button className="action-btn-secondary flex-1" onClick={onRejectOrder}>
                    <XCircle className="h-4 w-4 mr-2" />
                    <span>Rejeitar</span>
                  </button>
                </>
              )}
              
              {isAssigned && (
                <button className="action-btn w-full" onClick={() => onUpdateStatus('in_progress')}>
                  <Car className="h-4 w-4 mr-2" />
                  <span>Iniciar Corrida</span>
                </button>
              )}
              
              {isInProgress && (
                <button className="action-btn w-full" onClick={() => onUpdateStatus('completed')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Finalizar Corrida</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Original card for desktop
  return (
    <Card key={order.id} className="overflow-hidden">
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
