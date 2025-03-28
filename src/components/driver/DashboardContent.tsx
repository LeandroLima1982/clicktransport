
import React from 'react';
import DriverDashboard from './DriverDashboard';
import ServiceOrderList from './ServiceOrderList';
import { useServiceOrders } from './hooks/useServiceOrders';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useServiceOrderSubscription } from '@/hooks/driver/useServiceOrderSubscription';

interface DashboardContentProps {
  driverId: string | null;
  isLoading: boolean;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ driverId, isLoading: isLoadingDriver }) => {
  const { 
    orders, 
    isLoading, 
    handleUpdateStatus,
    refreshOrders
  } = useServiceOrders(driverId);

  // Subscribe to service order updates
  useServiceOrderSubscription({ 
    driverId, 
    onNotification: () => {
      // Refresh orders when any notification is received
      refreshOrders();
    }
  });

  if (isLoadingDriver || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DriverDashboard />
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Ordens de Serviço Atribuídas</h2>
        {orders && orders.length > 0 ? (
          <ServiceOrderList 
            orders={orders}
            driverId={driverId}
            handleUpdateStatus={handleUpdateStatus}
          />
        ) : (
          <div className="text-center p-8 bg-muted rounded-lg">
            <p className="text-muted-foreground">Nenhuma ordem de serviço atribuída no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;
