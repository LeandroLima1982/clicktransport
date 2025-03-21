
import { useState, useRef, useEffect, useCallback } from 'react';
import { fetchAddressSuggestions, loadGoogleMapsScript } from '@/utils/maps';
import { toast } from 'sonner';

export const useLocationSuggestions = () => {
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [isLoadingOriginSuggestions, setIsLoadingOriginSuggestions] = useState(false);
  const [isLoadingDestinationSuggestions, setIsLoadingDestinationSuggestions] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(false);
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [apiLoadAttempted, setApiLoadAttempted] = useState(false);
  const lastOriginSearch = useRef<string>('');
  const lastDestinationSearch = useRef<string>('');

  // Tenta carregar a API do Google Maps uma vez durante a inicialização
  useEffect(() => {
    const loadApi = async () => {
      if (apiLoaded) return; // Skip if already loaded
      
      try {
        await loadGoogleMapsScript();
        console.log('Google Maps API carregada com sucesso no useLocationSuggestions');
        setApiLoaded(true);
      } catch (error) {
        console.error('Failed to load Google Maps API', error);
        setApiLoaded(false);
        
        // Notificar apenas uma vez
        if (!apiLoadAttempted) {
          toast.error("Erro ao carregar a API do Google Maps", {
            description: "As sugestões de endereço podem não funcionar corretamente"
          });
        }
      }
      setApiLoadAttempted(true);
    };
    
    loadApi();
    
    // Retry loading after a delay if it failed initially
    if (!apiLoaded && apiLoadAttempted) {
      const retryTimeout = setTimeout(() => {
        setApiLoadAttempted(false); // Allow another attempt
      }, 10000);
      
      return () => clearTimeout(retryTimeout);
    }
  }, [apiLoaded, apiLoadAttempted]);

  const handleOriginChange = useCallback((value: string) => {
    if (originTimeoutRef.current) {
      clearTimeout(originTimeoutRef.current);
    }
    
    if (value.length < 3) {
      setOriginSuggestions([]);
      setIsLoadingOriginSuggestions(false);
      return;
    }
    
    // Skip if the search is the same as last time
    if (value === lastOriginSearch.current) {
      return;
    }
    
    lastOriginSearch.current = value;
    setIsLoadingOriginSuggestions(true);
    
    originTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Fetching origin suggestions for:', value);
        const suggestions = await fetchAddressSuggestions(value);
        setOriginSuggestions(suggestions);
        console.log('Got suggestions:', suggestions.length);
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
  }, [originSuggestions.length]);

  const handleDestinationChange = useCallback((value: string) => {
    if (destinationTimeoutRef.current) {
      clearTimeout(destinationTimeoutRef.current);
    }
    
    if (value.length < 3) {
      setDestinationSuggestions([]);
      setIsLoadingDestinationSuggestions(false);
      return;
    }
    
    // Skip if the search is the same as last time
    if (value === lastDestinationSearch.current) {
      return;
    }
    
    lastDestinationSearch.current = value;
    setIsLoadingDestinationSuggestions(true);
    
    destinationTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Fetching destination suggestions for:', value);
        const suggestions = await fetchAddressSuggestions(value);
        setDestinationSuggestions(suggestions);
        console.log('Got suggestions:', suggestions.length);
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
  }, [destinationSuggestions.length]);

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

  // Limpar timeouts quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (originTimeoutRef.current) {
        clearTimeout(originTimeoutRef.current);
      }
      if (destinationTimeoutRef.current) {
        clearTimeout(destinationTimeoutRef.current);
      }
    };
  }, []);

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
