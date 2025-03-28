
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDriverId } from './useDriverId';
import { useServiceOrderSubscription } from './useServiceOrderSubscription';
import { toast } from 'sonner';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<number>(0);
  const { user } = useAuth();
  const driverId = useDriverId(user);

  // Subscribe to service order changes with the correct parameter structure
  useServiceOrderSubscription({
    driverId,
    onNotification: () => {
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
