
import React from 'react';
import { ArrowRight, CornerDownLeft } from 'lucide-react';

interface TripTypeTabsProps {
  value: string;
  onChange: (value: 'oneway' | 'roundtrip') => void;
}

const TripTypeTabs: React.FC<TripTypeTabsProps> = ({ value, onChange }) => {
  return (
    <div className="inline-flex rounded-full p-1 bg-gray-100">
      <button
        type="button"
        onClick={() => onChange('oneway')}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-full ${
          value === 'oneway'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-700'
        }`}
      >
        <ArrowRight className="h-4 w-4 mr-2" />
        Ida
      </button>
      
      <button
        type="button"
        onClick={() => onChange('roundtrip')}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-full ${
          value === 'roundtrip'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-700'
        }`}
      >
        <CornerDownLeft className="h-4 w-4 mr-2" />
        Ida e Volta
      </button>
    </div>
  );
};

export default TripTypeTabs;
