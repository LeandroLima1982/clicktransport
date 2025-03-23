import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, X, Loader2, Check, Clipboard } from 'lucide-react';
import { getPlaceIcon, formatPlaceName, isBrazilianCEP, formatCEP } from '@/utils/mapbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LocationInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suggestions: any[];
  onSelectSuggestion: (suggestion: any) => void;
  onClear: () => void;
  showNumberField?: boolean;
  numberValue?: string;
  onNumberChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  showNumberField = false,
  numberValue = '',
  onNumberChange
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCEP, setIsCEP] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasPasted = useRef(false);

  useEffect(() => {
    setIsCEP(isBrazilianCEP(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (isBrazilianCEP(newValue)) {
      const formattedEvent = {
        ...e,
        target: {
          ...e.target,
          value: formatCEP(newValue)
        }
      };
      setIsLoading(true);
      onChange(formattedEvent);
    } else {
      setIsLoading(newValue.length >= 3);
      onChange(e);
    }
    if (newValue.length === 0) {
      setIsLoading(false);
      hasPasted.current = false;
    }
  };

  const handlePaste = () => {
    hasPasted.current = true;
    setTimeout(() => {
      if (inputRef.current && inputRef.current.value.length > 5) {
        setIsLoading(true);
      }
    }, 100);
  };

  useEffect(() => {
    if (suggestions.length > 0 || !value || value.length < 3) {
      setIsLoading(false);
    }
    if (hasPasted.current && suggestions.length > 0) {
      if (value.length > 20 && suggestions[0].place_type?.includes('address')) {
        onSelectSuggestion(suggestions[0]);
        hasPasted.current = false;
        toast.success("Endereço identificado com sucesso!");
      }
    }
  }, [suggestions, value, onSelectSuggestion]);

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && clipboardText.length > 3) {
        const mockEvent = {
          target: {
            name: id,
            value: clipboardText
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(mockEvent);
        hasPasted.current = true;
        setIsLoading(true);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    } catch (error) {
      console.error("Falha ao acessar área de transferência:", error);
      toast.error("Não foi possível acessar a área de transferência");
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-700 block text-sm font-medium">
        {label}
      </Label>
      
      <div className="flex items-center">
        <div className="relative flex-grow">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <MapPin className="h-4 w-4 text-amber-400" />
          </div>
          
          <Input 
            ref={inputRef}
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onPaste={handlePaste}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsFocused(false), 200);
            }}
            className={`pl-9 pr-9 py-2.5 text-sm md:h-11 ${showNumberField ? 'rounded-r-none' : 'rounded-lg'} border ${
              isCEP ? 'border-green-200 bg-green-50' : 'border-gray-100'
            } shadow-sm bg-white focus:border-amber-300 focus:ring-amber-300 text-gray-700`}
          />
          
          {isCEP && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <Check className="h-3.5 w-3.5 text-green-500" />
            </div>
          )}
          
          {isLoading && !isCEP && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <Loader2 className="h-3.5 w-3.5 text-gray-400 animate-spin" />
            </div>
          )}
          
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full p-0 bg-gray-100 hover:bg-gray-200"
              aria-label="Limpar campo"
            >
              <X className="h-3.5 w-3.5 text-gray-600" />
            </Button>
          )}
          
          {suggestions.length > 0 && (isFocused || isLoading) && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-md shadow-lg max-h-60 overflow-auto">
              <ul className="py-1">
                {suggestions.map(suggestion => (
                  <li
                    key={suggestion.id}
                    className="px-3 py-2.5 text-xs sm:text-sm hover:bg-amber-50 cursor-pointer border-b border-gray-50 last:border-0"
                    onClick={() => onSelectSuggestion(suggestion)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {getPlaceIcon(suggestion)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium line-clamp-1 text-sm">
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
        
        {showNumberField && onNumberChange && (
          <Input
            id={`${id}-number`}
            type="text"
            value={numberValue}
            onChange={onNumberChange}
            className="w-16 text-center py-2.5 text-sm md:h-11 rounded-l-none rounded-r-lg border-l-0 border border-gray-100 shadow-sm text-gray-700"
            placeholder="Nº"
          />
        )}
      </div>
    </div>
  );
};

export default LocationInput;
