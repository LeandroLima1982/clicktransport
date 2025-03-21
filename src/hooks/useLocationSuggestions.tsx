
import { useState, useRef, useEffect } from 'react';
import { fetchAddressSuggestions, isValidApiKey } from '@/utils/googlemaps';
import { toast } from 'sonner';

export const useLocationSuggestions = () => {
  const [originSuggestions, setOriginSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check API key validity on mount
  useEffect(() => {
    const checkApiKey = () => {
      const valid = isValidApiKey();
      setApiKeyValid(valid);
      
      if (!valid) {
        console.error('Google Maps API key is invalid or missing');
        toast.error('Configure a chave da API do Google Maps para utilizar sugestões de endereço');
      } else {
        console.log('Google Maps API key is valid');
      }
    };
    
    checkApiKey();
  }, []);

  const handleOriginChange = (value: string) => {
    if (!apiKeyValid || value.length < 3) {
      setOriginSuggestions([]);
      return;
    }
    
    if (originTimeoutRef.current) {
      clearTimeout(originTimeoutRef.current);
    }
    
    originTimeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        console.log('Fetching origin suggestions for:', value);
        const suggestions = await fetchAddressSuggestions(value);
        setOriginSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching origin suggestions:', error);
        toast.error('Erro ao buscar sugestões de endereço');
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 500);
  };

  const handleDestinationChange = (value: string) => {
    if (!apiKeyValid || value.length < 3) {
      setDestinationSuggestions([]);
      return;
    }
    
    if (destinationTimeoutRef.current) {
      clearTimeout(destinationTimeoutRef.current);
    }
    
    destinationTimeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        console.log('Fetching destination suggestions for:', value);
        const suggestions = await fetchAddressSuggestions(value);
        setDestinationSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching destination suggestions:', error);
        toast.error('Erro ao buscar sugestões de endereço');
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 500);
  };

  const selectOriginSuggestion = (suggestion: google.maps.places.AutocompletePrediction) => {
    const placeName = suggestion.description;
    setOriginSuggestions([]);
    return placeName;
  };

  const selectDestinationSuggestion = (suggestion: google.maps.places.AutocompletePrediction) => {
    const placeName = suggestion.description;
    setDestinationSuggestions([]);
    return placeName;
  };

  // Function to update API key (can be called after receiving it from the user)
  const updateApiKey = (newKey: string) => {
    // This function would be implemented in the main application code
    console.log('API key update requested');
  };

  return {
    originSuggestions,
    destinationSuggestions,
    isLoadingSuggestions,
    apiKeyValid,
    handleOriginChange,
    handleDestinationChange,
    selectOriginSuggestion,
    selectDestinationSuggestion,
    clearOriginSuggestions: () => setOriginSuggestions([]),
    clearDestinationSuggestions: () => setDestinationSuggestions([]),
    updateApiKey
  };
};
