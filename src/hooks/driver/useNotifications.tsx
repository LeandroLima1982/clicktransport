
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDriverId } from './useDriverId';
import { useServiceOrderSubscription, ServiceOrderNotificationPayload } from './useServiceOrderSubscription';
import { toast } from 'sonner';
import { playNotificationSound } from '@/services/notifications/notificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<number>(0);
  const { user } = useAuth();
  const driverId = useDriverId(user);

  // Subscribe to service order changes
  useServiceOrderSubscription({
    driverId,
    onNotification: (payload: ServiceOrderNotificationPayload) => {
      // Play notification sound
      playNotificationSound();
      
      // Show a toast notification
      toast.success('Nova ordem de serviço!', {
        description: 'Você recebeu uma nova atribuição de serviço.',
        duration: 5000,
      });
      
      // Increment notification count
      setNotifications(prev => prev + 1);
    }
  });

  // Reset notifications when app is focused
  useEffect(() => {
    const handleFocus = () => {
      // Only reset if there are notifications and user is active
      if (notifications > 0 && document.visibilityState === 'visible') {
        setTimeout(() => {
          setNotifications(0);
        }, 3000);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [notifications]);

  const clearNotifications = () => {
    setNotifications(0);
  };

  return { notifications, clearNotifications };
};
