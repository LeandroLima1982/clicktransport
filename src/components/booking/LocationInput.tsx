
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, X, Loader2 } from 'lucide-react';
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
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Função que mostra indicador de carregamento quando
  // o usuário está digitando e a consulta está em andamento
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(e.target.value.length >= 3);
    onChange(e);
    
    // Se o input ficar vazio, garantir que o indicador de carregamento desaparece
    if (e.target.value.length === 0) {
      setIsLoading(false);
    }
  };

  // Atualizar estado de carregamento quando as sugestões mudam
  React.useEffect(() => {
    if (suggestions.length > 0 || !value || value.length < 3) {
      setIsLoading(false);
    }
  }, [suggestions, value]);

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
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Pequeno atraso para permitir que o clique em uma sugestão seja registrado
            setTimeout(() => setIsFocused(false), 200);
          }}
          className="pl-10 pr-10 py-6 rounded-lg border border-gray-100 shadow-sm bg-white focus:border-amber-300 focus:ring-amber-300"
        />
        {isLoading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
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
        
        {suggestions.length > 0 && (isFocused || isLoading) && (
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
                      <div className="font-medium line-clamp-1">
                        {suggestion.text || suggestion.place_name.split(',')[0]}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                        {suggestion.place_name}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {value && suggestions.length === 0 && !isLoading && isFocused && value.length >= 3 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-md shadow-lg p-4 text-sm text-center text-gray-500">
            Nenhum resultado encontrado. Tente adicionar mais detalhes como número, bairro ou cidade.
          </div>
        )}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Digite um endereço completo com número, bairro e cidade para melhores resultados
      </div>
    </div>
  );
};

export default LocationInput;
