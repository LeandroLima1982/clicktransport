
import React from 'react';
import { InboxIcon } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-60 bg-gray-50 rounded-md border border-dashed border-gray-300">
      <InboxIcon className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">Nenhuma reserva encontrada</h3>
      <p className="text-sm text-gray-500">Não há reservas para exibir no momento.</p>
    </div>
  );
};

export default EmptyState;
