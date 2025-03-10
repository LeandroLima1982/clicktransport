
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-[500px]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Carregando informações da rota...</p>
      </div>
    </div>
  );
};

export default LoadingState;
