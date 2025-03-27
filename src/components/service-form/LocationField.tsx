
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Clipboard, Check, Loader2, X, Navigation } from 'lucide-react';
import { 
  getPlaceIcon, 
  formatPlaceName, 
  isBrazilianCEP, 
  formatCEP, 
  detectAddressFormat,
  getAddressAutofill,
  getCurrentPosition,
  reverseGeocode
} from '@/utils/mapbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCEP, setIsCEP] = useState(false);
  const [addressFormat, setAddressFormat] = useState<'cep' | 'street' | 'poi' | 'unknown'>('unknown');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasPasted = useRef(false);

  // Check address format
  useEffect(() => {
    if (!value) {
      setAddressFormat('unknown');
      setIsCEP(false);
      return;
    }
    
    setIsCEP(isBrazilianCEP(value));
    setAddressFormat(detectAddressFormat(value));
  }, [value]);

  // Function to handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // If it's a CEP, format it
    if (isBrazilianCEP(newValue)) {
      // Simulate a new event with the formatted CEP
      const formattedEvent = {
        ...e,
        target: {
          ...e.target,
          name: e.target.name,
          value: formatCEP(newValue)
        }
      };
      
      setIsLoading(true);
      onChange(formattedEvent);
    } else {
      setIsLoading(newValue.length >= 3);
      onChange(e);
    }
    
    // If the input is empty, ensure loading indicator disappears
    if (newValue.length === 0) {
      setIsLoading(false);
      hasPasted.current = false;
    }
  };

  // Handle paste event
  const handlePaste = () => {
    // Mark that a paste occurred to potentially trigger immediate suggestion search
    hasPasted.current = true;
    
    // Give time for value to update before checking
    setTimeout(() => {
      if (inputRef.current && inputRef.current.value.length > 5) {
        setIsLoading(true);
      }
    }, 100);
  };

  // Update loading state when suggestions change
  useEffect(() => {
    if (suggestions.length > 0 || !value || value.length < 3) {
      setIsLoading(false);
    }
    
    // If a complete address was pasted and we received suggestions
    if (hasPasted.current && suggestions.length > 0) {
      // Auto-select the first suggestion if it's a very complete address
      if (value.length > 20 && suggestions[0].place_type?.includes('address')) {
        onSelectSuggestion(suggestions[0]);
        hasPasted.current = false;
        toast.success("Endereço identificado com sucesso!");
      }
    }
  }, [suggestions, value, onSelectSuggestion]);

  // Function to get data from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && clipboardText.length > 3) {
        // Simulate an input event with the clipboard text
        const mockEvent = {
          target: {
            name: name,
            value: clipboardText
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        handleInputChange(mockEvent);
        hasPasted.current = true;
        setIsLoading(true);
        
        // Focus the input
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    } catch (error) {
      console.error("Falha ao acessar área de transferência:", error);
      toast.error("Não foi possível acessar a área de transferência");
    }
  };

  // Handle using current location (Uber-like feature)
  const handleUseCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      
      // Show loading toast
      toast.loading("Obtendo sua localização atual...");
      
      // Get current position
      const position = await getCurrentPosition();
      const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
      
      // Reverse geocode to get address
      const address = await reverseGeocode(coords);
      
      if (address) {
        // Create a mock event to update the input
        const mockEvent = {
          target: {
            name: name,
            value: address
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(mockEvent);
        toast.success("Localização atual obtida com sucesso!");
      } else {
        toast.error("Não foi possível obter seu endereço atual");
      }
    } catch (error) {
      console.error("Erro ao obter localização:", error);
      toast.error("Erro ao obter sua localização. Verifique as permissões do navegador.");
    } finally {
      setIsGettingLocation(false);
      toast.dismiss();
    }
  };

  // Clear field value
  const handleClear = () => {
    const mockEvent = {
      target: {
        name: name,
        value: ""
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(mockEvent);
    
    // Focus the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        <MapPin className="h-4 w-4 inline mr-1" /> {label}
      </label>
      <div className="relative">
        <Input 
          ref={inputRef}
          id={id} 
          name={name} 
          value={value} 
          onChange={handleInputChange}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Small delay to allow click on a suggestion to register
            setTimeout(() => setIsFocused(false), 200);
          }}
          required
          placeholder={placeholder}
          className={`
            pl-10 pr-24 
            ${isCEP ? 'border-green-200 bg-green-50' : ''} 
            ${addressFormat === 'street' ? 'border-blue-100 bg-blue-50' : ''}
            ${addressFormat === 'poi' ? 'border-purple-100 bg-purple-50' : ''}
          `}
        />

        {/* Leading icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <MapPin className={`h-4 w-4 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`} />
        </div>
        
        {/* Buttons on the right side */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
          {/* Clear button (only if there's a value) */}
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-6 w-6 rounded-full p-0 hover:bg-gray-100"
              title="Limpar"
            >
              <X className="h-3 w-3 text-gray-400" />
            </Button>
          )}
          
          {/* Current location button (when no value) */}
          {!value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleUseCurrentLocation}
              disabled={isGettingLocation}
              className="h-6 w-6 rounded-full p-0 hover:bg-blue-100"
              title="Usar minha localização atual"
            >
              {isGettingLocation ? (
                <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
              ) : (
                <Navigation className="h-3 w-3 text-blue-500" />
              )}
            </Button>
          )}
          
          {/* Paste button (when no value) */}
          {!value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handlePasteFromClipboard}
              className="h-6 w-6 rounded-full p-0 hover:bg-gray-100"
              title="Colar da área de transferência"
            >
              <Clipboard className="h-3 w-3 text-gray-400" />
            </Button>
          )}
          
          {/* Valid CEP indicator */}
          {isCEP && (
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500" />
            </div>
          )}
          
          {/* Loading indicator */}
          {isLoading && !isCEP && (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
            </div>
          )}
        </div>
        
        {/* Suggestions list - Uber-like styling */}
        {suggestions.length > 0 && (isFocused || isLoading) && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-start border-b border-gray-100 last:border-none"
                onClick={() => onSelectSuggestion(suggestion)}
              >
                <div className="mr-2 mt-1 text-blue-500">
                  {getPlaceIcon(suggestion.place_type?.[0] || '')}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    {suggestion.text || suggestion.place_name.split(',')[0]}
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-1">
                    {suggestion.place_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* No results message */}
        {value && suggestions.length === 0 && !isLoading && isFocused && value.length >= 3 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">Nenhum resultado encontrado</div>
            <div className="text-xs text-gray-400">Tente adicionar mais detalhes ou verifique o endereço</div>
          </div>
        )}
      </div>
      
      {/* Contextual tips */}
      {isCEP && (
        <div className="text-xs text-green-600 mt-1 flex items-center">
          <Check className="h-3 w-3 mr-1" />
          CEP válido. Selecione nas sugestões para completar o endereço
        </div>
      )}
    </div>
  );
};

export default LocationField;
