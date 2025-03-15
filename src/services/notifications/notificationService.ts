
import { toast } from 'sonner';
import { ServiceOrder } from '@/types/serviceOrder';

export const playNotificationSound = () => {
  const audio = new Audio('/notification.mp3');
  audio.play().catch(err => console.log('Audio play failed:', err));
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
