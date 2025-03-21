
import React from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { getPlaceIcon, formatPlaceName } from '@/utils/googlemaps';

interface LocationFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suggestions: any[];
  onSelectSuggestion: (suggestion: any) => void;
}

const LocationField: React.FC<LocationFieldProps> = ({
  id,
  name,
  label,
  value,
  placeholder = "Digite o endereço",
  onChange,
  suggestions,
  onSelectSuggestion
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
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-start"
                onClick={() => onSelectSuggestion(suggestion)}
              >
                <div className="mr-2 mt-1">
                  {getPlaceIcon(suggestion.types?.[0] || 'address')}
                </div>
                <div>
                  <div className="font-medium">{suggestion.structured_formatting?.main_text || suggestion.description}</div>
                  <div className="text-xs text-gray-500">{suggestion.structured_formatting?.secondary_text || ''}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationField;
