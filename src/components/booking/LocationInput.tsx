
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
  const [isCEP, setIsCEP] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasPasted = useRef(false);

  // Verifica se o valor atual é um CEP
  useEffect(() => {
    setIsCEP(isBrazilianCEP(value));
  }, [value]);

  // Função que mostra indicador de carregamento quando
  // o usuário está digitando e a consulta está em andamento
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Se for um CEP, formatar
    if (isBrazilianCEP(newValue)) {
      // Simular um novo evento com o CEP formatado
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
    
    // Se o input ficar vazio, garantir que o indicador de carregamento desaparece
    if (newValue.length === 0) {
      setIsLoading(false);
      hasPasted.current = false;
    }
  };

  // Função especial para lidar com colagem (paste)
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
            name: id,
            value: clipboardText
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        handleChange(mockEvent);
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
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-700 block text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <MapPin className="h-5 w-5 text-amber-400" />
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
            // Pequeno atraso para permitir que o clique em uma sugestão seja registrado
            setTimeout(() => setIsFocused(false), 200);
          }}
          className={`pl-10 pr-${value ? '24' : '10'} py-6 rounded-lg border ${isCEP ? 'border-green-200 bg-green-50' : 'border-gray-100'} shadow-sm bg-white focus:border-amber-300 focus:ring-amber-300`}
        />
        
        {/* Botão de colar do clipboard */}
        {!value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handlePasteFromClipboard}
            className="absolute right-10 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full p-0 hover:bg-gray-100"
            title="Colar da área de transferência"
          >
            <Clipboard className="h-4 w-4 text-gray-400" />
          </Button>
        )}
        
        {/* Indicador de CEP válido */}
        {isCEP && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <Check className="h-4 w-4 text-green-500" />
          </div>
        )}
        
        {/* Indicador de carregamento */}
        {isLoading && !isCEP && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          </div>
        )}
        
        {/* Botão de limpar */}
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
        
        {/* Lista de sugestões */}
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
        
        {/* Mensagem de nenhum resultado */}
        {value && suggestions.length === 0 && !isLoading && isFocused && value.length >= 3 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-md shadow-lg p-4 text-sm text-center text-gray-500">
            Nenhum resultado encontrado. Tente adicionar mais detalhes como número, bairro ou cidade.
          </div>
        )}
      </div>
      
      {/* Dicas para o usuário */}
      <div className="text-xs text-gray-500 mt-1">
        {isCEP ? 
          "CEP detectado! Selecione nas sugestões para completar o endereço" : 
          "Digite um CEP, rua ou endereço completo para melhores resultados"}
      </div>
    </div>
  );
};

export default LocationInput;
