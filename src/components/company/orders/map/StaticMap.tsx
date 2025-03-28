
import React from 'react';

export interface StaticMapProps {
  mapUrl: string;  // Changed from staticMapUrl
  originAddress: string;
  destinationAddress: string;
}

const StaticMap: React.FC<StaticMapProps> = ({ mapUrl, originAddress, destinationAddress }) => {
  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200">
      <img 
        src={mapUrl} 
        alt={`Rota de ${originAddress} para ${destinationAddress}`}
        className="w-full h-auto"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-2 text-xs">
        <div><strong>Origem:</strong> {originAddress}</div>
        <div><strong>Destino:</strong> {destinationAddress}</div>
      </div>
    </div>
  );
};

export default StaticMap;
