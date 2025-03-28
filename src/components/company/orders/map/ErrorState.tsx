
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col justify-center items-center h-[500px] text-center">
      <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
      <p className="text-destructive text-lg mb-4">{message}</p>
      {onRetry && <Button onClick={onRetry}>Tentar novamente</Button>}
    </div>
  );
};

export default ErrorState;
