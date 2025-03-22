
import { ServiceOrder } from "@/types/serviceOrder";

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
