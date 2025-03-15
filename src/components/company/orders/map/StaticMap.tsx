
import React from 'react';
import { Loader2 } from 'lucide-react';

interface StaticMapProps {
  url: string | null;
}

const StaticMap: React.FC<StaticMapProps> = ({ url }) => {
  if (!url) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="ml-2 text-sm text-muted-foreground">Carregando mapa estático...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <img 
        src={url} 
        alt="Mapa da rota" 
        className="max-w-full max-h-full object-contain rounded-md" 
      />
    </div>
  );
};

export default StaticMap;
