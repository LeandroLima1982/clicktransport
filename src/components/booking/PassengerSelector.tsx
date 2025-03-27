
import React from 'react';
import { Plus, Minus, Users } from 'lucide-react';

interface PassengerSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const PassengerSelector: React.FC<PassengerSelectorProps> = ({ value, onChange }) => {
  const passengers = parseInt(value) || 1;
  
  const decrementPassengers = () => {
    if (passengers > 1) {
      onChange((passengers - 1).toString());
    }
  };
  
  const incrementPassengers = () => {
    if (passengers < 10) {
      onChange((passengers + 1).toString());
    }
  };
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-lg font-medium">{passengers}</span>
        <span className="text-xs text-gray-500">
          {passengers === 1 ? 'Passageiro' : 'Passageiros'}
        </span>
      </div>
      
      <div className="flex items-center">
        <button
          type="button"
          onClick={decrementPassengers}
          disabled={passengers <= 1}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            passengers <= 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Minus className="h-4 w-4" />
        </button>
        
        <button
          type="button"
          onClick={incrementPassengers}
          disabled={passengers >= 10}
          className={`w-8 h-8 rounded-full flex items-center justify-center ml-2 transition-colors ${
            passengers >= 10
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PassengerSelector;
