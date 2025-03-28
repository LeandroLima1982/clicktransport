
/**
 * Notification service for handling notifications and sharing
 */

// Function to share via WhatsApp
export const shareViaWhatsApp = (message: string) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
};

// Function to play notification sound
export const playNotificationSound = () => {
  try {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(error => {
      console.error('Failed to play notification sound:', error);
    });
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Format booking message for sharing
export const formatBookingShareMessage = (
  bookingData: any, 
  options: { simplified?: boolean; referenceCode?: string; totalPrice?: number } = {}
) => {
  const { simplified = false, referenceCode, totalPrice = 0 } = options;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  if (simplified) {
    // Simplified message format
    return `*Detalhes da Reserva #${referenceCode}*\n\n` +
      `📍 *Trajeto:* ${bookingData.origin} → ${bookingData.destination}\n` +
      `📅 *Data:* ${bookingData.date ? new Date(bookingData.date).toLocaleDateString('pt-BR') : 'Não definida'}\n` +
      `🕒 *Horário:* ${bookingData.time || '00:00'}\n` +
      (bookingData.returnDate ? `📅 *Retorno:* ${new Date(bookingData.returnDate).toLocaleDateString('pt-BR')} às ${bookingData.returnTime || '00:00'}\n` : '') +
      `👥 *Passageiros:* ${bookingData.passengerData.length}\n` +
      `💰 *Valor:* ${formatCurrency(totalPrice)}\n\n` +
      `Reserva realizada em ${bookingData.creationDate || 'data não disponível'}`;
  }
  
  // Detailed message format for complete sharing
  let message = `*Detalhes da Viagem*\n\n`;
  
  message += `📍 *Origem:* ${bookingData.origin}\n`;
  message += `📍 *Destino:* ${bookingData.destination}\n\n`;
  
  message += `📅 *Data de ida:* ${bookingData.date ? new Date(bookingData.date).toLocaleDateString('pt-BR') : 'Não definida'}\n`;
  message += `🕒 *Horário:* ${bookingData.time || '00:00'}\n\n`;
  
  if (bookingData.tripType === 'roundtrip' && bookingData.returnDate) {
    message += `📅 *Data de volta:* ${new Date(bookingData.returnDate).toLocaleDateString('pt-BR')}\n`;
    message += `🕒 *Horário:* ${bookingData.returnTime || '00:00'}\n\n`;
  }
  
  if (bookingData.passengerData && bookingData.passengerData.length > 0) {
    message += `👥 *Passageiros:*\n`;
    bookingData.passengerData.forEach((passenger: any, index: number) => {
      message += `${index + 1}. ${passenger.name} - ${passenger.phone}\n`;
    });
    message += '\n';
  }
  
  if (referenceCode) {
    message += `🆔 *Código da reserva:* ${referenceCode}\n`;
  }
  
  if (totalPrice) {
    message += `💰 *Valor total:* ${formatCurrency(totalPrice)}\n\n`;
  }
  
  message += `Reserva realizada em ${bookingData.creationDate || 'data não disponível'}`;
  
  return message;
};
