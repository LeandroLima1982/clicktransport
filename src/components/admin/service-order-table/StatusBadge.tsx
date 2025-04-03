
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    case 'in_progress':
      return <Badge className="bg-blue-100 text-blue-800">Em Progresso</Badge>;
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
    case 'assigned':
      return <Badge className="bg-indigo-100 text-indigo-800">Atribuído</Badge>;
    case 'created':
      return <Badge className="bg-purple-100 text-purple-800">Criado</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default StatusBadge;
