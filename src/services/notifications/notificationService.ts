
import { toast } from 'sonner';
import { ServiceOrder } from '@/types/serviceOrder';

export const playNotificationSound = () => {
  const audio = new Audio('/notification.mp3');
  audio.play().catch(err => console.log('Audio play failed:', err));
  
  // Vibrate device if supported (mobile-friendly)
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100]);
  }
};

export const showAssignmentNotification = (order: ServiceOrder) => {
  // Customize the notification based on whether it's a new assignment or update
  toast.success('Nova ordem de serviço atribuída!', {
    description: `Origem: ${order.origin} - Destino: ${order.destination}`,
    duration: 5000,
    action: {
      label: 'Ver Detalhes',
      onClick: () => {
        // This could redirect to the order details page in the future
        console.log('Navigating to order details for:', order.id);
      }
    }
  });
};

// Mobile-friendly haptic feedback
export const vibrate = (pattern: number | number[]) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// Feedback patterns
export const feedbackPatterns = {
  success: [100, 30, 100],
  error: 150,
  warning: [100, 50, 100, 50],
  notification: [50, 100, 50]
};
