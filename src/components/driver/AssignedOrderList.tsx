
import React from 'react';
import OrderCard from './OrderCard';
import { ServiceOrder } from './hooks/useServiceOrders';

interface AssignedOrderListProps {
  orders: ServiceOrder[];
  driverId: string | null;
  handleUpdateStatus: (orderId: string, newStatus: string) => Promise<void>;
}

const AssignedOrderList: React.FC<AssignedOrderListProps> = ({ 
  orders, 
  driverId, 
  handleUpdateStatus 
}) => {
  const assignedOrders = orders.filter(
    order => ['assigned', 'in_progress'].includes(order.status) && order.driver_id === driverId
  );

  if (assignedOrders.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-muted-foreground">Você não tem ordens de serviço atribuídas no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignedOrders.map(order => (
        <OrderCard
          key={order.id}
          order={order}
          driverId={driverId}
          handleUpdateStatus={handleUpdateStatus}
        />
      ))}
    </div>
  );
};

export default AssignedOrderList;
