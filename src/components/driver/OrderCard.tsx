
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle, XCircle, Car } from 'lucide-react';
import { formatDate, getStatusBadge } from './utils/formatters';
import OrderDetailSheet from './OrderDetailSheet';
import { ServiceOrder } from './hooks/useServiceOrders';

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
            
            <div className="mt-4 space-y-2">
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Origem:</p>
                  <p>{order.origin}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Destino:</p>
                  <p>{order.destination}</p>
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
                      onClick={() => handleAcceptOrder(order.id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Aceitar Corrida
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleRejectOrder(order.id)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Rejeitar
                    </Button>
                  </>
                )}
                
                {isAssigned && (
                  <Button 
                    className="w-full" 
                    onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                  >
                    <Car className="mr-2 h-4 w-4" />
                    Iniciar Corrida
                  </Button>
                )}
                
                {isInProgress && (
                  <Button 
                    className="w-full" 
                    variant="default" 
                    onClick={() => handleUpdateStatus(order.id, 'completed')}
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
