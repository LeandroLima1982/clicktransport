
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDriverId } from './useDriverId';
import { useServiceOrderSubscription } from './useServiceOrderSubscription';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<number>(0);
  const { user } = useAuth();
  const driverId = useDriverId(user);

  // Subscribe to service order changes
  useServiceOrderSubscription(driverId, () => {
    // Increment notification count when a new assignment is detected
    setNotifications(prev => prev + 1);
  });

  const clearNotifications = () => {
    setNotifications(0);
  };

  return { notifications, clearNotifications };
};
