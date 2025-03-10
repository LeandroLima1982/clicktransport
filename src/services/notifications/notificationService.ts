
import { toast } from 'sonner';
import { ServiceOrder } from '@/types/serviceOrder';

export const playNotificationSound = () => {
  const audio = new Audio('/notification.mp3');
  audio.play().catch(err => console.log('Audio play failed:', err));
};

export const showAssignmentNotification = (order: ServiceOrder) => {
  toast.success('Nova ordem de serviço atribuída!', {
    description: `Origem: ${order.origin} - Destino: ${order.destination}`,
    duration: 5000,
  });
};
