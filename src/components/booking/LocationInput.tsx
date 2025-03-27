
import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface LocationInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suggestions: any[];
  onSelectSuggestion: (suggestion: any) => void;
  onClear: () => void;
  loading?: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  suggestions,
  onSelectSuggestion,
  onClear,
  loading = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Adiciona event listener para fechar as sugestões quando clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <Input
          ref={inputRef}
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          className="pl-10 pr-10 py-2.5 h-12 rounded-full bg-gray-50 border-gray-200 focus:ring-blue-500 focus:border-blue-500"
        />
        
        {loading && (
          <div className="absolute inset-y-0 right-10 flex items-center">
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          </div>
        )}
        
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {isFocused && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef} 
          className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base overflow-auto focus:outline-none sm:text-sm"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 flex items-center hover:bg-gray-100"
              onClick={() => {
                onSelectSuggestion(suggestion);
                setIsFocused(false);
              }}
            >
              <MapPin className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
              <div className="font-normal truncate">{suggestion.place_name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationInput;
