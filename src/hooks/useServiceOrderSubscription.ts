
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { playNotificationSound, showAssignmentNotification } from '@/services/notifications/notificationService';
import { ServiceOrder } from '@/types/serviceOrder';

export const useServiceOrderSubscription = (
  callback: (payload?: any) => void
) => {
  useEffect(() => {
    // Inscreve-se em todas as alterações da tabela service_orders
    const channel = supabase
      .channel('service_orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_orders'
        },
        (payload: any) => {
          console.log('Service order change detected:', payload);
          callback(payload);
          
          // Notificar apenas para novos registros
          if (payload.eventType === 'INSERT') {
            playNotificationSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [callback]);
};

