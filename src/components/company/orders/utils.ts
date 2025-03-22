
import { ServiceOrder } from "@/types/serviceOrder";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const translateStatus = (status: ServiceOrder['status']) => {
  switch (status) {
    case 'pending':
      return 'Pendente';
    case 'created':
      return 'Criada';
    case 'assigned':
      return 'Atribuída';
    case 'in_progress':
      return 'Em andamento';
    case 'completed':
      return 'Concluída';
    case 'cancelled':
      return 'Cancelada';
    default:
      return status;
  }
};

export const formatRelativeDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};
