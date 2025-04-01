
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { playNotificationSound, showAssignmentNotification } from '@/services/notifications/notificationService';
import { ServiceOrder } from '@/types/serviceOrder';

export const useServiceOrderSubscription = (
  callback: (payload?: any) => void
) => {
  useEffect(() => {
    console.log('Setting up service order subscription');
    
    // Generate a unique channel name based on timestamp to avoid conflicts
    const channelName = `service_orders_changes_${Date.now()}`;
    
    // Subscribe to all changes of the service_orders table
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_orders'
        },
        (payload: any) => {
          console.log('Service order change detected in subscription:', payload);
          
          // Call the callback with the payload
          callback(payload);
          
          // Play notification sound for important events
          if (payload.eventType === 'INSERT') {
            console.log('New service order created, playing notification sound');
            playNotificationSound();
          }
          
          if (payload.eventType === 'UPDATE' && 
              payload.old.status !== payload.new.status) {
            console.log('Service order status changed, notifying');
            // Only play sound for specific status changes if needed
            if (['assigned', 'in_progress', 'completed'].includes(payload.new.status)) {
              playNotificationSound();
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`Service order subscription status (${channelName}):`, status);
        
        if (status !== 'SUBSCRIBED') {
          console.error('Failed to subscribe to service order changes:', status);
        }
      });

    return () => {
      console.log('Removing service order subscription');
      supabase.removeChannel(channel);
    };
  }, [callback]);
};
