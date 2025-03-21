
import React from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, AlertTriangle } from 'lucide-react';
import { getPlaceIconProps, formatPlaceNameData, isValidApiKey } from '@/utils/googlemaps';
import { Button } from '@/components/ui/button';
import ApiKeyButton from '../ApiKeyButton';

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
  const isApiKeyValid = isValidApiKey();
  
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
        
        {!isApiKeyValid && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-amber-700">Chave da API do Google Maps inválida</span>
            <div className="ml-auto">
              <ApiKeyButton />
            </div>
          </div>
        )}
        
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => {
              const iconProps = getPlaceIconProps(suggestion.types?.[0] || 'address');
              const IconComponent = iconProps.icon;
              const placeData = formatPlaceNameData(suggestion);
              
              return (
                <div 
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-start"
                  onClick={() => onSelectSuggestion(suggestion)}
                >
                  <div className="mr-2 mt-1">
                    <IconComponent className={iconProps.className} />
                  </div>
                  <div>
                    <div className="font-medium">{placeData.mainText}</div>
                    <div className="text-xs text-gray-500">{placeData.secondaryText || ''}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationField;
