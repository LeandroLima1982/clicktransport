
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="flex justify-center items-center flex-col h-60">
      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
      <p className="text-muted-foreground">Nenhuma reserva encontrada</p>
    </div>
  );
};

export default EmptyState;
