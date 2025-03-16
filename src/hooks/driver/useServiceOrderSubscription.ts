
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notifyDriverNewAssignment } from '@/services/notifications/workflowNotificationService';
import { ServiceOrder } from '@/types/serviceOrder';

export const useServiceOrderSubscription = (
  driverId: string | null,
  onNotification: (payload?: any) => void
) => {
  useEffect(() => {
    if (!driverId) return;

    const channel = supabase
      .channel('service_orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_orders',
          filter: `driver_id=eq.${driverId}`
        },
        (payload: any) => {
          console.log('Service order change detected:', payload);

          // Case 1: New order inserted with this driver assigned
          if (payload.eventType === 'INSERT' && 
              (payload.new.status === 'assigned' || payload.new.driver_id === driverId)) {
            notifyDriverNewAssignment(payload.new as ServiceOrder);
            onNotification(payload);
          }
          
          // Case 2: Existing order updated to assign this driver
          if (payload.eventType === 'UPDATE' && 
              payload.old.driver_id !== payload.new.driver_id && 
              payload.new.driver_id === driverId) {
            notifyDriverNewAssignment(payload.new as ServiceOrder);
            onNotification(payload);
          }
          
          // Case 3: Order status changed to assigned
          if (payload.eventType === 'UPDATE' && 
              payload.old.status !== 'assigned' && 
              payload.new.status === 'assigned') {
            notifyDriverNewAssignment(payload.new as ServiceOrder);
            onNotification(payload);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId, onNotification]);
};
