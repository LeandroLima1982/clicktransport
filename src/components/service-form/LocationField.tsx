import React from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { getPlaceIcon, formatPlaceName } from '@/utils/maps';

interface LocationFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suggestions: any[];
  onSelectSuggestion: (suggestion: any) => void;
  isLoading?: boolean;
}

const LocationField: React.FC<LocationFieldProps> = ({
  id,
  name,
  label,
  value,
  placeholder = "Digite o endereço",
  onChange,
  suggestions,
  onSelectSuggestion,
  isLoading = false
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        <MapPin className="h-4 w-4 inline mr-1" /> {label}
      </label>
      <div className="relative">
        <Input 
          id={id} 
          name={name} 
          value={value} 
          onChange={onChange} 
          required
          placeholder={placeholder}
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
          </div>
        )}
        
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <div 
                key={suggestion.place_id || index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-start"
                onClick={() => onSelectSuggestion(suggestion)}
              >
                <div className="mr-2 mt-1">
                  {getPlaceIcon(suggestion)}
                </div>
                <div>
                  {formatPlaceName(suggestion)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 mt-1">
        Digite o endereço completo com número, bairro e cidade para melhores resultados
      </div>
    </div>
  );
};

export default LocationField;
