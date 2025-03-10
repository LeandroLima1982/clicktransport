
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<number>(0);
  const [driverId, setDriverId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const fetchDriverId = async () => {
      const { data, error } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching driver ID:', error);
        return;
      }

      if (data) {
        setDriverId(data.id);
      }
    };

    fetchDriverId();
  }, [user]);

  useEffect(() => {
    if (!driverId) return;

    // Subscribe to new service order assignments and updates
    const channel = supabase
      .channel('service_orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE)
          schema: 'public',
          table: 'service_orders',
          filter: `driver_id=eq.${driverId}`
        },
        (payload: any) => {
          console.log('Service order change detected:', payload);

          // For new assignments (INSERT)
          if (payload.eventType === 'INSERT' && payload.new.status === 'assigned') {
            playNotificationSound();
            showAssignmentNotification(payload.new);
            setNotifications(prev => prev + 1);
          }
          
          // For updates to existing orders (UPDATE)
          if (payload.eventType === 'UPDATE' && 
              payload.new.status === 'assigned' && 
              payload.old.driver_id !== payload.new.driver_id) {
            playNotificationSound();
            showAssignmentNotification(payload.new);
            setNotifications(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId]);

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(err => console.log('Audio play failed:', err));
  };

  const showAssignmentNotification = (order: any) => {
    toast.success('Nova ordem de serviço atribuída!', {
      description: `Origem: ${order.origin} - Destino: ${order.destination}`,
      duration: 5000,
    });
  };

  const clearNotifications = () => {
    setNotifications(0);
  };

  return { notifications, clearNotifications };
};
