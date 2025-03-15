
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

// Share booking via WhatsApp
export const shareViaWhatsApp = (message: string) => {
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  
  // Open in new tab
  window.open(whatsappUrl, '_blank');
  
  // Provide feedback
  vibrate(feedbackPatterns.success);
  toast.success('Compartilhando resumo da reserva via WhatsApp');
};

// Format booking details for sharing
export const formatBookingShareMessage = (
  bookingData: {
    origin: string;
    destination: string;
    date?: Date | string;
    time?: string;
    tripType?: string;
    passengerData?: { name: string; phone: string }[];
  },
  options: {
    includePassengers?: boolean;
    includePrice?: boolean;
    simplified?: boolean;
    referenceCode?: string;
    totalPrice?: number;
  } = {}
) => {
  const { simplified = false, includePassengers = true, referenceCode, totalPrice } = options;
  
  // Format date if it exists
  let dateStr = '';
  if (bookingData.date) {
    if (typeof bookingData.date === 'string') {
      dateStr = bookingData.date;
    } else {
      const dateObj = new Date(bookingData.date);
      dateStr = dateObj.toLocaleDateString('pt-BR');
    }
  }
  
  // Build message based on simplified or detailed format
  if (simplified) {
    let message = `🚗 *Reserva de Transporte*\n\n`;
    
    if (referenceCode) {
      message += `*Código:* ${referenceCode}\n`;
    }
    
    message += `*Data:* ${dateStr}${bookingData.time ? ' às ' + bookingData.time : ''}\n`;
    message += `*Trajeto:* ${bookingData.origin} → ${bookingData.destination}\n\n`;
    
    if (includePassengers && bookingData.passengerData && bookingData.passengerData.length > 0) {
      message += `*Passageiros:*\n`;
      bookingData.passengerData.forEach((passenger, index) => {
        message += `${index + 1}. ${passenger.name} - ${passenger.phone}\n`;
      });
    }
    
    return message;
  } else {
    // More detailed message for other sharing methods
    let message = `🚗 *Detalhes da Reserva de Transporte*\n\n`;
    
    if (referenceCode) {
      message += `*Código da Reserva:* ${referenceCode}\n\n`;
    }
    
    message += `*Data:* ${dateStr}${bookingData.time ? ' às ' + bookingData.time : ''}\n`;
    message += `*Origem:* ${bookingData.origin}\n`;
    message += `*Destino:* ${bookingData.destination}\n`;
    
    if (bookingData.tripType) {
      message += `*Tipo de Viagem:* ${bookingData.tripType === 'roundtrip' ? 'Ida e Volta' : 'Somente Ida'}\n`;
    }
    
    if (includePassengers && bookingData.passengerData && bookingData.passengerData.length > 0) {
      message += `\n*Passageiros:*\n`;
      bookingData.passengerData.forEach((passenger, index) => {
        message += `${index + 1}. ${passenger.name} - ${passenger.phone}\n`;
      });
    }
    
    if (includePrice && totalPrice) {
      message += `\n*Valor Total:* R$ ${totalPrice.toFixed(2)}\n`;
    }
    
    message += `\nReserva realizada através do nosso sistema de transporte.`;
    
    return message;
  }
};
