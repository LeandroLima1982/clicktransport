
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import { getPlaceIcon, formatPlaceName } from '@/utils/mapbox';

interface LocationInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suggestions: any[];
  onSelectSuggestion: (suggestion: any) => void;
}

const LocationInput: React.FC<LocationInputProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  suggestions,
  onSelectSuggestion
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-700 flex items-center text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="pl-10 py-6 rounded-lg border-gray-200"
        />
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
            <ul className="py-1 max-h-60 overflow-auto">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.id}
                  className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => onSelectSuggestion(suggestion)}
                >
                  <div className="flex items-center gap-2">
                    {getPlaceIcon(suggestion)}
                    {formatPlaceName(suggestion)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationInput;
