
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
    arrivalTime?: string;
    returnDate?: string;
    returnTime?: string;
    returnArrivalTime?: string;
    duration?: number | null;
    tripType?: string;
    passengerData?: { name: string; phone: string }[];
    creationDate?: string;
  },
  options: {
    includePassengers?: boolean;
    includePrice?: boolean;
    simplified?: boolean;
    referenceCode?: string;
    totalPrice?: number;
  } = {}
) => {
  const { 
    simplified = false, 
    includePassengers = true, 
    includePrice = false, 
    referenceCode, 
    totalPrice 
  } = options;
  
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
  
  // Calculate travel time if duration exists
  let travelTimeStr = '';
  if (bookingData.duration) {
    const hours = Math.floor(bookingData.duration / 60);
    const mins = bookingData.duration % 60;
    
    if (hours === 0) {
      travelTimeStr = `${mins} min`;
    } else if (mins === 0) {
      travelTimeStr = `${hours}h`;
    } else {
      travelTimeStr = `${hours}h ${mins}min`;
    }
  }
  
  // Build message based on simplified or detailed format
  if (simplified) {
    let message = `🚗 *Reserva de Transporte*\n\n`;
    
    if (referenceCode) {
      message += `*Código:* ${referenceCode}\n`;
    }
    
    if (bookingData.creationDate) {
      message += `*Reserva criada em:* ${bookingData.creationDate}\n\n`;
    }
    
    message += `*Trajeto:* ${bookingData.origin} → ${bookingData.destination}\n\n`;
    
    message += `*Data de ida:* ${dateStr}\n`;
    
    if (bookingData.time) {
      message += `*Saída:* ${bookingData.time}\n`;
    }
    
    if (bookingData.arrivalTime) {
      message += `*Chegada prevista:* ${bookingData.arrivalTime}\n`;
    }
    
    if (travelTimeStr) {
      message += `*Duração estimada:* ${travelTimeStr}\n`;
    }
    
    if (bookingData.tripType === 'roundtrip' && bookingData.returnDate) {
      message += `\n*Data de volta:* ${bookingData.returnDate}\n`;
      
      if (bookingData.returnTime) {
        message += `*Saída:* ${bookingData.returnTime}\n`;
      }
      
      if (bookingData.returnArrivalTime) {
        message += `*Chegada prevista:* ${bookingData.returnArrivalTime}\n`;
      }
      
      if (travelTimeStr) {
        message += `*Duração estimada:* ${travelTimeStr}\n`;
      }
    }
    
    if (includePrice && totalPrice) {
      message += `\n*Valor Total:* R$ ${totalPrice.toFixed(2)}\n`;
    }
    
    if (includePassengers && bookingData.passengerData && bookingData.passengerData.length > 0) {
      message += `\n*Passageiros:*\n`;
      bookingData.passengerData.forEach((passenger, index) => {
        message += `${index + 1}. ${passenger.name} - ${passenger.phone}\n`;
      });
    }
    
    return message;
  } else {
    // More detailed message for other sharing methods
    let message = `🚗 *Detalhes da Reserva de Transporte*\n\n`;
    
    if (referenceCode) {
      message += `*Código da Reserva:* ${referenceCode}\n`;
    }
    
    if (bookingData.creationDate) {
      message += `*Reserva criada em:* ${bookingData.creationDate}\n\n`;
    }
    
    message += `*Origem:* ${bookingData.origin}\n`;
    message += `*Destino:* ${bookingData.destination}\n\n`;
    
    message += `*Data de ida:* ${dateStr}\n`;
    
    if (bookingData.time) {
      message += `*Horário de saída:* ${bookingData.time}\n`;
    }
    
    if (bookingData.arrivalTime) {
      message += `*Horário de chegada previsto:* ${bookingData.arrivalTime}\n`;
    }
    
    if (travelTimeStr) {
      message += `*Duração estimada:* ${travelTimeStr}\n`;
    }
    
    if (bookingData.tripType === 'roundtrip' && bookingData.returnDate) {
      message += `\n*Data de volta:* ${bookingData.returnDate}\n`;
      
      if (bookingData.returnTime) {
        message += `*Horário de saída:* ${bookingData.returnTime}\n`;
      }
      
      if (bookingData.returnArrivalTime) {
        message += `*Horário de chegada previsto:* ${bookingData.returnArrivalTime}\n`;
      }
      
      if (travelTimeStr) {
        message += `*Duração estimada:* ${travelTimeStr}\n`;
      }
    }
    
    if (bookingData.tripType) {
      message += `\n*Tipo de Viagem:* ${bookingData.tripType === 'roundtrip' ? 'Ida e Volta' : 'Somente Ida'}\n`;
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
