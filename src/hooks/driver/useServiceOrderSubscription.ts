
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { playNotificationSound, showAssignmentNotification } from '@/services/notifications/notificationService';

export const useServiceOrderSubscription = (
  driverId: string | null,
  onNotification: () => void
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

          if (payload.eventType === 'INSERT' && payload.new.status === 'assigned') {
            playNotificationSound();
            showAssignmentNotification(payload.new);
            onNotification();
          }
          
          if (payload.eventType === 'UPDATE' && 
              payload.new.status === 'assigned' && 
              payload.old.driver_id !== payload.new.driver_id) {
            playNotificationSound();
            showAssignmentNotification(payload.new);
            onNotification();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId, onNotification]);
};
