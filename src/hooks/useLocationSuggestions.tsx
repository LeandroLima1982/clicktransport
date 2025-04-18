
import { useState, useRef, useEffect } from 'react';
import { fetchAddressSuggestions, isBrazilianCEP } from '@/utils/googlemaps';
import { toast } from 'sonner';

export const useLocationSuggestions = () => {
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Limitar o número de requisições para evitar alcançar limites da API
  useEffect(() => {
    if (requestCount > 0) {
      const timer = setTimeout(() => {
        setRequestCount(0);
      }, 60000); // Reseta o contador a cada minuto
      
      return () => clearTimeout(timer);
    }
  }, [requestCount]);

  const handleOriginChange = (value: string) => {
    if (originTimeoutRef.current) {
      clearTimeout(originTimeoutRef.current);
    }
    
    // Priorize CEPs - busca quase imediata para CEPs
    if (isBrazilianCEP(value)) {
      setIsLoadingSuggestions(true);
      originTimeoutRef.current = setTimeout(async () => {
        try {
          const suggestions = await fetchAddressSuggestions(value);
          setOriginSuggestions(suggestions);
          
          if (suggestions.length === 0) {
            toast.info("CEP válido, mas sem endereços encontrados. Tente adicionar mais detalhes.");
          }
        } catch (error) {
          console.error('Erro ao buscar sugestões de CEP:', error);
          toast.error('Erro ao buscar o CEP. Verifique se o formato está correto.');
        } finally {
          setIsLoadingSuggestions(false);
          setRequestCount(prev => prev + 1);
        }
      }, 100); // Delay menor para CEP (100ms)
    } 
    // Para endereços comuns, espera um pouco mais para o usuário terminar de digitar
    else if (value.length >= 3) {
      setIsLoadingSuggestions(true);
      
      originTimeoutRef.current = setTimeout(async () => {
        try {
          const suggestions = await fetchAddressSuggestions(value);
          setOriginSuggestions(suggestions);
          setRequestCount(prev => prev + 1);
        } catch (error) {
          console.error('Erro ao buscar sugestões:', error);
          
          // Exibir toast de erro apenas se já tentamos várias vezes
          if (requestCount > 10) {
            toast.error('Limite de buscas atingido. Tente novamente em alguns minutos.');
          }
        } finally {
          setIsLoadingSuggestions(false);
        }
      }, 500); // 500ms para endereços normais
    } else {
      setOriginSuggestions([]);
    }
  };

  const handleDestinationChange = (value: string) => {
    if (destinationTimeoutRef.current) {
      clearTimeout(destinationTimeoutRef.current);
    }
    
    // Priorize CEPs - busca quase imediata
    if (isBrazilianCEP(value)) {
      setIsLoadingSuggestions(true);
      destinationTimeoutRef.current = setTimeout(async () => {
        try {
          const suggestions = await fetchAddressSuggestions(value);
          setDestinationSuggestions(suggestions);
          
          if (suggestions.length === 0) {
            toast.info("CEP válido, mas sem endereços encontrados. Tente adicionar mais detalhes.");
          }
        } catch (error) {
          console.error('Erro ao buscar sugestões de CEP:', error);
          toast.error('Erro ao buscar o CEP. Verifique se o formato está correto.');
        } finally {
          setIsLoadingSuggestions(false);
          setRequestCount(prev => prev + 1);
        }
      }, 100); // Delay menor para CEP (100ms)
    }
    // Para endereços comuns, espera um pouco mais
    else if (value.length >= 3) {
      setIsLoadingSuggestions(true);
      
      destinationTimeoutRef.current = setTimeout(async () => {
        try {
          const suggestions = await fetchAddressSuggestions(value);
          setDestinationSuggestions(suggestions);
          setRequestCount(prev => prev + 1);
        } catch (error) {
          console.error('Erro ao buscar sugestões:', error);
          
          if (requestCount > 10) {
            toast.error('Limite de buscas atingido. Tente novamente em alguns minutos.');
          }
        } finally {
          setIsLoadingSuggestions(false);
        }
      }, 500); // 500ms para endereços normais
    } else {
      setDestinationSuggestions([]);
    }
  };

  const selectOriginSuggestion = (suggestion: any) => {
    const placeName = suggestion.place_name;
    setOriginSuggestions([]);
    return placeName;
  };

  const selectDestinationSuggestion = (suggestion: any) => {
    const placeName = suggestion.place_name;
    setDestinationSuggestions([]);
    return placeName;
  };

  return {
    originSuggestions,
    destinationSuggestions,
    isLoadingSuggestions,
    handleOriginChange,
    handleDestinationChange,
    selectOriginSuggestion,
    selectDestinationSuggestion,
    clearOriginSuggestions: () => setOriginSuggestions([]),
    clearDestinationSuggestions: () => setDestinationSuggestions([])
  };
};
