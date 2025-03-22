
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Clipboard, Check, Loader2 } from 'lucide-react';
import { getPlaceIcon, formatPlaceName, isBrazilianCEP, formatCEP } from '@/utils/mapbox';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const hasPasted = useRef(false);

  // Verifica se o valor atual é um CEP
  useEffect(() => {
    setIsCEP(isBrazilianCEP(value));
  }, [value]);

  // Função para lidar com mudanças no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Se for um CEP, formatar
    if (isBrazilianCEP(newValue)) {
      // Simular um novo evento com o CEP formatado
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
    
    // Se o input ficar vazio, garantir que o indicador de carregamento desaparece
    if (newValue.length === 0) {
      setIsLoading(false);
      hasPasted.current = false;
    }
  };

  // Função para lidar com colagem (paste)
  const handlePaste = () => {
    // Marcamos que houve uma colagem para buscar sugestões imediatamente
    hasPasted.current = true;
    
    // Damos um tempo para o valor ser atualizado antes de verificar
    setTimeout(() => {
      if (inputRef.current && inputRef.current.value.length > 5) {
        setIsLoading(true);
      }
    }, 100);
  };

  // Atualizar estado de carregamento quando as sugestões mudam
  useEffect(() => {
    if (suggestions.length > 0 || !value || value.length < 3) {
      setIsLoading(false);
    }
    
    // Se foi colado um endereço completo e recebemos sugestões
    if (hasPasted.current && suggestions.length > 0) {
      // Seleciona automaticamente a primeira sugestão se for um endereço muito completo
      if (value.length > 20 && suggestions[0].place_type?.includes('address')) {
        onSelectSuggestion(suggestions[0]);
        hasPasted.current = false;
        toast.success("Endereço identificado com sucesso!");
      }
    }
  }, [suggestions, value, onSelectSuggestion]);

  // Função para obter dados da área de transferência
  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && clipboardText.length > 3) {
        // Simular um evento de input com o texto copiado
        const mockEvent = {
          target: {
            name: name,
            value: clipboardText
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        handleInputChange(mockEvent);
        hasPasted.current = true;
        setIsLoading(true);
        
        // Focar no input
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
            // Pequeno atraso para permitir que o clique em uma sugestão seja registrado
            setTimeout(() => setIsFocused(false), 200);
          }}
          required
          placeholder={placeholder}
          className={`${isCEP ? 'border-green-200 bg-green-50' : ''}`}
        />
        
        {/* Botão de colar do clipboard */}
        {!value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handlePasteFromClipboard}
            className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full p-0 hover:bg-gray-100"
            title="Colar da área de transferência"
          >
            <Clipboard className="h-3 w-3 text-gray-400" />
          </Button>
        )}
        
        {/* Indicador de CEP válido */}
        {isCEP && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <Check className="h-4 w-4 text-green-500" />
          </div>
        )}
        
        {/* Indicador de carregamento */}
        {isLoading && !isCEP && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          </div>
        )}
        
        {/* Lista de sugestões */}
        {suggestions.length > 0 && (isFocused || isLoading) && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-start"
                onClick={() => onSelectSuggestion(suggestion)}
              >
                <div className="mr-2 mt-1">
                  {getPlaceIcon(suggestion.place_type[0])}
                </div>
                <div>
                  <div className="font-medium">{suggestion.text || suggestion.place_name.split(',')[0]}</div>
                  <div className="text-xs text-gray-500">{suggestion.place_name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Mensagem de nenhum resultado */}
        {value && suggestions.length === 0 && !isLoading && isFocused && value.length >= 3 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-md shadow-lg p-3 text-xs text-center text-gray-500">
            Nenhum resultado encontrado. Tente adicionar mais detalhes.
          </div>
        )}
      </div>
      
      {/* Dicas contextuais */}
      {isCEP && (
        <div className="text-xs text-green-600 mt-1">
          CEP detectado! Selecione nas sugestões para completar o endereço
        </div>
      )}
    </div>
  );
};

export default LocationField;
