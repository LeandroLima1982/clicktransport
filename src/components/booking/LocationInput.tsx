
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, X, Loader2 } from 'lucide-react';
import { getPlaceIcon, formatPlaceName, isGoogleMapsApiKeySet, loadGoogleMapsScript } from '@/utils/googleMaps';
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
  isLoading?: boolean;
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
  isLoading = false
}) => {
  const [apiLoaded, setApiLoaded] = useState(false);
  
  // Load Google Maps API on component mount
  useEffect(() => {
    if (isGoogleMapsApiKeySet()) {
      loadGoogleMapsScript()
        .then(() => setApiLoaded(true))
        .catch(err => console.error('Failed to load Google Maps API:', err));
    }
  }, []);
  
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
        
        {isLoading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
          </div>
        )}
        
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
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-md shadow-lg">
            <ul className="py-1 max-h-60 overflow-auto">
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.place_id || index}
                  className="px-3 py-2 text-sm hover:bg-amber-50 cursor-pointer"
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
        
        {!apiLoaded && isGoogleMapsApiKeySet() && (
          <div className="absolute z-10 mt-1 w-full bg-amber-50 border border-amber-200 rounded-md p-2 text-sm">
            Carregando API do Google Maps...
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 mt-1 px-1">
        Digite o endereço completo com número, bairro e cidade para melhores resultados
      </div>
    </div>
  );
};

export default LocationInput;
