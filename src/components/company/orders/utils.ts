
import { format } from 'date-fns';

export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Não definido';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  } catch (e) {
    return dateString;
  }
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
