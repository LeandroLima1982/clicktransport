
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import React from 'react';

export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Não definido';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  } catch (e) {
    return dateString;
  }
};

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    case 'assigned':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Atribuído</Badge>;
    case 'in_progress':
      return <Badge variant="outline" className="bg-purple-100 text-purple-800">Em Progresso</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-green-100 text-green-800">Concluído</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelado</Badge>;
    default:
      return <Badge variant="outline">Desconhecido</Badge>;
  }
};
