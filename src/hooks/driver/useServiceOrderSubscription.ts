
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notifyDriverNewAssignment, notifyTripStarted, notifyTripCompleted } from '@/services/notifications/workflowNotificationService';
import { playNotificationSound } from '@/services/notifications/notificationService';
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
            playNotificationSound();
            notifyDriverNewAssignment(payload.new as ServiceOrder);
            onNotification(payload);
          }
          
          // Case 2: Existing order updated to assign this driver
          if (payload.eventType === 'UPDATE' && 
              payload.old.driver_id !== payload.new.driver_id && 
              payload.new.driver_id === driverId) {
            playNotificationSound();
            notifyDriverNewAssignment(payload.new as ServiceOrder);
            onNotification(payload);
          }
          
          // Case 3: Order status changed to assigned
          if (payload.eventType === 'UPDATE' && 
              payload.old.status !== 'assigned' && 
              payload.new.status === 'assigned') {
            playNotificationSound();
            notifyDriverNewAssignment(payload.new as ServiceOrder);
            onNotification(payload);
          }
          
          // Case 4: Trip started - status changed to in_progress
          if (payload.eventType === 'UPDATE' && 
              payload.old.status !== 'in_progress' && 
              payload.new.status === 'in_progress') {
            playNotificationSound();
            notifyTripStarted(payload.new as ServiceOrder);
            onNotification({
              ...payload,
              eventName: 'trip_started'
            });
          }
          
          // Case 5: Trip completed - status changed to completed
          if (payload.eventType === 'UPDATE' && 
              payload.old.status !== 'completed' && 
              payload.new.status === 'completed') {
            playNotificationSound();
            notifyTripCompleted(payload.new as ServiceOrder);
            onNotification({
              ...payload,
              eventName: 'trip_completed'
            });
          }
        }
      )
      .subscribe();

    // Subscribe to location updates for this driver
    const locationChannel = supabase
      .channel('driver_location_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_locations',
          filter: `driver_id=eq.${driverId}`
        },
        (payload: any) => {
          console.log('Driver location update:', payload);
          // Pass location updates to callback
          onNotification({
            ...payload,
            eventName: 'location_update'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(locationChannel);
    };
  }, [driverId, onNotification]);
};
