
import React from 'react';
import { Spinner } from '@/components/ui/spinner';

const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
      <div className="flex flex-col items-center gap-2">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
};

export default Loading;
