
import { useState, useRef } from 'react';
import { fetchAddressSuggestions } from '@/utils/googlemaps';
import { toast } from 'sonner';

export const useLocationSuggestions = () => {
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleOriginChange = (value: string) => {
    if (value.length < 3) {
      setOriginSuggestions([]);
      return;
    }
    
    if (originTimeoutRef.current) {
      clearTimeout(originTimeoutRef.current);
    }
    
    originTimeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
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
    if (value.length < 3) {
      setDestinationSuggestions([]);
      return;
    }
    
    if (destinationTimeoutRef.current) {
      clearTimeout(destinationTimeoutRef.current);
    }
    
    destinationTimeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
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

  const selectOriginSuggestion = (suggestion: any) => {
    const placeName = suggestion.description;
    setOriginSuggestions([]);
    return placeName;
  };

  const selectDestinationSuggestion = (suggestion: any) => {
    const placeName = suggestion.description;
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
