
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Não definido';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  } catch (e) {
    return dateString;
  }
};

export const formatRelativeDate = (dateString: string | null) => {
  if (!dateString) return 'Não definido';
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  } catch (e) {
    return dateString;
  }
};

export const truncateAddress = (address: string, maxLength: number) => {
  if (address.length <= maxLength) return address;
  return `${address.substring(0, maxLength)}...`;
};

export const translateStatus = (status: string) => {
  const statusMap: {[key: string]: string} = {
    'pending': 'Pendente',
    'assigned': 'Atribuído',
    'in_progress': 'Em progresso',
    'completed': 'Concluído',
    'cancelled': 'Cancelado'
  };
  return statusMap[status] || status;
};

// Format distance in meters to a human-readable format
export const formatDistance = (meters: number) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

// Format duration in seconds to a human-readable format
export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
};
