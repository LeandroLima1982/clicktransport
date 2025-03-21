
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, X } from 'lucide-react';
import { getPlaceIcon, formatPlaceName } from '@/utils/mapbox';
import { Button } from '@/components/ui/button';

interface LocationInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suggestions: any[];
  onSelectSuggestion: (suggestion: any) => void;
  onClear: () => void;
}

const LocationInput: React.FC<LocationInputProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  suggestions,
  onSelectSuggestion,
  onClear
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-700 block text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-400" />
        <Input
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="pl-10 pr-10 py-6 rounded-lg border border-gray-100 shadow-sm bg-white focus:border-amber-300 focus:ring-amber-300"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        )}
        
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-md shadow-lg max-h-60 overflow-auto">
            <ul className="py-1">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.id}
                  className="px-3 py-3 text-sm hover:bg-amber-50 cursor-pointer border-b border-gray-50 last:border-0"
                  onClick={() => onSelectSuggestion(suggestion)}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {getPlaceIcon(suggestion)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium line-clamp-1">{suggestion.place_name.split(',')[0]}</div>
                      <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">{suggestion.place_name}</div>
                    </div>
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
