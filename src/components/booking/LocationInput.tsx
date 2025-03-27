
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectSuggestion: (suggestion: any) => void;
  onClear: () => void;
  suggestions: any[];
  isLoading?: boolean;
  className?: string;
}

const LocationInput: React.FC<LocationInputProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  onSelectSuggestion,
  onClear,
  suggestions,
  isLoading = false,
  className
}) => {
  const hasSuggestions = suggestions.length > 0;
  
  return (
    <div className={cn("relative", className)}>
      {label && (
        <Label htmlFor={id} className="mb-1.5 block text-sm font-medium">
          {label}
        </Label>
      )}
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <MapPin className="h-5 w-5" />
        </div>
        
        <Input
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="pl-10 pr-8 py-2 h-12 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
        />
        
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Limpar</span>
          </button>
        )}
      </div>
      
      {isLoading && (
        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      )}
      
      {hasSuggestions && (
        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white rounded-md shadow-lg border border-gray-200">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm ${
                  index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''
                }`}
                onClick={() => onSelectSuggestion(suggestion)}
              >
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mt-0.5 mr-2 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{suggestion.text}</div>
                    {suggestion.place_name && (
                      <div className="text-xs text-gray-500 truncate">
                        {suggestion.place_name}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationInput;
