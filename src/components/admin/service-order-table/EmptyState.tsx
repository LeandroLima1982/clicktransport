
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex justify-center items-center flex-col h-60">
      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
      <p className="text-muted-foreground">Nenhuma ordem de serviço encontrada</p>
      <p className="text-sm text-muted-foreground mt-2">
        Verifique se as reservas estão sendo convertidas em ordens de serviço corretamente
      </p>
    </div>
  );
};

export default EmptyState;
