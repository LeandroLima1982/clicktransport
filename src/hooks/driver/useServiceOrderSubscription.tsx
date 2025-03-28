
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { playNotificationSound } from '@/services/notifications/notificationService';
import { ServiceOrder } from '@/types/serviceOrder';

export interface ServiceOrderNotificationPayload {
  id?: string;
  status?: string;
  origin?: string;
  destination?: string;
  driver_id?: string;
  company_id?: string;
  eventType?: string;
  eventName?: string;
  new?: ServiceOrder;
  old?: Partial<ServiceOrder>;
  [key: string]: any;
}

interface UseServiceOrderSubscriptionProps {
  driverId: string | null;
  onNotification?: (payload: ServiceOrderNotificationPayload) => void;
}

export const useServiceOrderSubscription = ({
  driverId,
  onNotification
}: UseServiceOrderSubscriptionProps) => {
  const handleNotification = useCallback((payload: ServiceOrderNotificationPayload) => {
    console.log('Service order notification received:', payload);
    if (onNotification) {
      onNotification(payload);
    } else {
      // Default notification handling
      if (payload?.status === 'assigned' && payload?.driver_id === driverId) {
        playNotificationSound();
        toast.success('Nova corrida atribuída!', {
          description: `Origem: ${payload.origin || 'Não especificada'}`,
          duration: 6000,
        });
      }

      if (payload?.status === 'cancelled' && payload?.driver_id === driverId) {
        playNotificationSound();
        toast.error('Corrida cancelada!', {
          description: `A corrida para ${payload.destination || 'destino'} foi cancelada.`,
          duration: 6000,
        });
      }
    }
  }, [driverId, onNotification]);

  useEffect(() => {
    if (!driverId) return;

    console.log('Setting up service order subscription for driver:', driverId);

    // Get all channels the subscription is already active for
    const existingChannels = supabase.getChannels();
    const channelName = `driver_orders_${driverId}`;
    
    // Check if we already have an active subscription for this driver
    const existingChannel = existingChannels.find(channel => channel.topic === channelName);
    if (existingChannel) {
      console.log('Channel already exists, removing it first');
      supabase.removeChannel(existingChannel);
    }

    // Create a channel for service orders related to this driver
    const channel = supabase.channel(channelName);
    
    // Use the channel.on method with correct parameters
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'service_orders',
        filter: `driver_id=eq.${driverId}`
      },
      (payload) => {
        console.log('Service order change detected:', payload);
        
        const newData = payload.new as ServiceOrderNotificationPayload;
        
        // Handle different types of events
        if (payload.eventType === 'UPDATE') {
          handleNotification(newData);
        } else if (payload.eventType === 'INSERT') {
          handleNotification(newData);
        }
      }
    )
    .subscribe((status) => {
      console.log('Service order subscription status:', status);
    });

    return () => {
      console.log('Removing service order subscription');
      supabase.removeChannel(channel);
    };
  }, [driverId, handleNotification]);

  return null;
};
