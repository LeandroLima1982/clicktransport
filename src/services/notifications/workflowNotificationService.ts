
import { toast } from 'sonner';
import { 
  playNotificationSound,
  vibrate, 
  feedbackPatterns 
} from './notificationService';
import { logInfo } from '../monitoring/systemLogService';
import { Booking } from '@/types/booking';
import { ServiceOrder } from '@/types/serviceOrder';

// Customer-facing notifications
export const notifyBookingCreated = (booking: Booking) => {
  toast.success('Reserva criada com sucesso!', {
    description: `Sua viagem de ${booking.origin} para ${booking.destination} foi agendada.`,
    duration: 5000
  });
  
  playNotificationSound();
  vibrate(feedbackPatterns.success);
  
  // Log notification
  logInfo('Notificação enviada: reserva criada', 'system', {
    booking_id: booking.id,
    user_id: booking.user_id
  });
};

export const notifyBookingConfirmed = (booking: Booking) => {
  toast.success('Reserva confirmada!', {
    description: `Sua viagem de ${booking.origin} para ${booking.destination} foi confirmada.`,
    duration: 5000,
    action: {
      label: 'Ver detalhes',
      onClick: () => {
        // Navigation logic could be added here
        console.log('Navigate to booking details', booking.id);
      }
    }
  });
  
  playNotificationSound();
  vibrate(feedbackPatterns.success);
  
  // Log notification
  logInfo('Notificação enviada: reserva confirmada', 'system', {
    booking_id: booking.id,
    user_id: booking.user_id
  });
};

// This function was missing in the service but referenced elsewhere
export const notifyDriverAssigned = (order: ServiceOrder, driverName: string) => {
  toast.success('Motorista atribuído!', {
    description: `${driverName} foi designado para sua viagem.`,
    duration: 6000,
    action: {
      label: 'Ver detalhes',
      onClick: () => {
        // Navigation logic could be added here
        console.log('Navigate to order details', order.id);
      }
    }
  });
  
  playNotificationSound();
  vibrate(feedbackPatterns.notification);
  
  // Log notification
  logInfo('Notificação enviada: motorista atribuído', 'system', {
    order_id: order.id,
    driver_id: order.driver_id
  });
};

export const notifyTripStarted = (order: ServiceOrder) => {
  toast.info('Viagem iniciada!', {
    description: `Sua viagem de ${order.origin} para ${order.destination} está em andamento.`,
    duration: 5000
  });
  
  playNotificationSound();
  
  // Log notification
  logInfo('Notificação enviada: viagem iniciada', 'system', {
    order_id: order.id
  });
};

export const notifyTripCompleted = (order: ServiceOrder) => {
  toast.success('Viagem concluída!', {
    description: `Sua viagem de ${order.origin} para ${order.destination} foi concluída com sucesso.`,
    duration: 6000,
    action: {
      label: 'Avaliar',
      onClick: () => {
        // Rating logic could be added here
        console.log('Open rating dialog for order', order.id);
      }
    }
  });
  
  playNotificationSound();
  vibrate(feedbackPatterns.success);
  
  // Log notification
  logInfo('Notificação enviada: viagem concluída', 'system', {
    order_id: order.id
  });
};

// Driver-facing notifications
export const notifyDriverNewAssignment = (order: ServiceOrder) => {
  toast.success('Nova corrida atribuída!', {
    description: `Origem: ${order.origin}, Destino: ${order.destination}`,
    duration: 8000,
    action: {
      label: 'Ver detalhes',
      onClick: () => {
        // Navigation logic could be added here
        console.log('Navigate to order details', order.id);
      }
    }
  });
  
  playNotificationSound();
  vibrate(feedbackPatterns.notification);
  
  // Log notification
  logInfo('Notificação enviada ao motorista: nova corrida', 'system', {
    order_id: order.id,
    driver_id: order.driver_id
  });
};

// Company-facing notifications
export const notifyCompanyNewOrder = (order: ServiceOrder) => {
  toast.success('Nova ordem de serviço!', {
    description: `Origem: ${order.origin}, Destino: ${order.destination}`,
    duration: 8000,
    action: {
      label: 'Ver detalhes',
      onClick: () => {
        // Navigation logic could be added here
        console.log('Navigate to order details', order.id);
      }
    }
  });
  
  playNotificationSound();
  
  // Log notification
  logInfo('Notificação enviada à empresa: nova ordem', 'system', {
    order_id: order.id,
    company_id: order.company_id
  });
};

export const notifyCompanyOrderStatusChange = (order: ServiceOrder, previousStatus: string) => {
  toast.info('Status de ordem atualizado!', {
    description: `Ordem #${order.id.substring(0, 8)}: ${previousStatus} → ${order.status}`,
    duration: 5000,
    action: {
      label: 'Ver detalhes',
      onClick: () => {
        // Navigation logic could be added here
        console.log('Navigate to order details', order.id);
      }
    }
  });
  
  // Log notification
  logInfo('Notificação enviada à empresa: atualização de status', 'system', {
    order_id: order.id,
    company_id: order.company_id,
    previous_status: previousStatus,
    new_status: order.status
  });
};
