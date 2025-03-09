
import React from 'react';
import OrderCard from './OrderCard';
import { ServiceOrder } from './hooks/useServiceOrders';

interface AvailableOrderListProps {
  orders: ServiceOrder[];
  driverId: string | null;
  handleAcceptOrder: (orderId: string) => Promise<void>;
  handleRejectOrder: (orderId: string) => Promise<void>;
  handleUpdateStatus: (orderId: string, newStatus: string) => Promise<void>;
}

const AvailableOrderList: React.FC<AvailableOrderListProps> = ({ 
  orders, 
  driverId, 
  handleAcceptOrder,
  handleRejectOrder,
  handleUpdateStatus
}) => {
  const availableOrders = orders.filter(
    order => order.status === 'pending' && !order.driver_id
  );

  if (availableOrders.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-muted-foreground">Não há ordens de serviço disponíveis no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {availableOrders.map(order => (
        <OrderCard
          key={order.id}
          order={order}
          driverId={driverId}
          handleAcceptOrder={handleAcceptOrder}
          handleRejectOrder={handleRejectOrder}
          handleUpdateStatus={handleUpdateStatus}
        />
      ))}
    </div>
  );
};

export default AvailableOrderList;
