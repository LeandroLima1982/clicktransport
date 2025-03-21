
import { useState, useRef, useEffect } from 'react';
import { fetchAddressSuggestions, loadGoogleMapsScript } from '@/utils/googleMaps';
import { toast } from 'sonner';

export const useLocationSuggestions = () => {
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [isLoadingOriginSuggestions, setIsLoadingOriginSuggestions] = useState(false);
  const [isLoadingDestinationSuggestions, setIsLoadingDestinationSuggestions] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(false);
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Tenta carregar a API do Google Maps uma vez durante a inicialização
  useEffect(() => {
    const loadApi = async () => {
      try {
        await loadGoogleMapsScript();
        setApiLoaded(true);
      } catch (error) {
        console.error('Failed to load Google Maps API', error);
        setApiLoaded(false); // Ainda marcamos como carregado para não bloquear a UI
      }
    };
    
    loadApi();
  }, []);

  const handleOriginChange = (value: string) => {
    if (originTimeoutRef.current) {
      clearTimeout(originTimeoutRef.current);
    }
    
    if (value.length < 3) {
      setOriginSuggestions([]);
      return;
    }
    
    setIsLoadingOriginSuggestions(true);
    originTimeoutRef.current = setTimeout(async () => {
      try {
        const suggestions = await fetchAddressSuggestions(value);
        setOriginSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching origin suggestions:', error);
        // Não limpe as sugestões aqui, mantenha as últimas ou use fallback
        
        // Notificar o usuário apenas uma vez
        if (originSuggestions.length === 0) {
          toast.error("Erro ao buscar sugestões de endereço. Tente um endereço mais completo.");
        }
      } finally {
        setIsLoadingOriginSuggestions(false);
      }
    }, 500);
  };

  const handleDestinationChange = (value: string) => {
    if (destinationTimeoutRef.current) {
      clearTimeout(destinationTimeoutRef.current);
    }
    
    if (value.length < 3) {
      setDestinationSuggestions([]);
      return;
    }
    
    setIsLoadingDestinationSuggestions(true);
    destinationTimeoutRef.current = setTimeout(async () => {
      try {
        const suggestions = await fetchAddressSuggestions(value);
        setDestinationSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching destination suggestions:', error);
        // Não limpe as sugestões aqui, mantenha as últimas ou use fallback
        
        // Notificar o usuário apenas uma vez
        if (destinationSuggestions.length === 0) {
          toast.error("Erro ao buscar sugestões de endereço. Tente um endereço mais completo.");
        }
      } finally {
        setIsLoadingDestinationSuggestions(false);
      }
    }, 500);
  };

  const selectOriginSuggestion = (suggestion: any) => {
    const placeName = suggestion.description || suggestion.formatted_address || '';
    setOriginSuggestions([]);
    return placeName;
  };

  const selectDestinationSuggestion = (suggestion: any) => {
    const placeName = suggestion.description || suggestion.formatted_address || '';
    setDestinationSuggestions([]);
    return placeName;
  };

  return {
    originSuggestions,
    destinationSuggestions,
    isLoadingOriginSuggestions,
    isLoadingDestinationSuggestions,
    apiLoaded,
    handleOriginChange,
    handleDestinationChange,
    selectOriginSuggestion,
    selectDestinationSuggestion,
    clearOriginSuggestions: () => setOriginSuggestions([]),
    clearDestinationSuggestions: () => setDestinationSuggestions([])
  };
};
