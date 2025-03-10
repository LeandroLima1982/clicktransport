
import { format, formatDistanceToNow } from 'date-fns';

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
    return formatDistanceToNow(date, { addSuffix: true });
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
