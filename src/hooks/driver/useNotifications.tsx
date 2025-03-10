
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

    // Subscribe to new service order assignments
    const channel = supabase
      .channel('service_orders_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'service_orders',
          filter: `driver_id=eq.${driverId}`
        },
        (payload: any) => {
          if (payload.new.status === 'assigned') {
            // Play notification sound
            const audio = new Audio('/notification.mp3');
            audio.play().catch(err => console.log('Audio play failed:', err));
            
            // Show toast notification
            toast.success('Nova ordem de serviço atribuída!', {
              description: 'Você recebeu uma nova atribuição de viagem.'
            });
            
            // Increment notification count
            setNotifications(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId]);

  const clearNotifications = () => {
    setNotifications(0);
  };

  return { notifications, clearNotifications };
};
