
import { useState, useRef } from 'react';
import { fetchAddressSuggestions } from '@/utils/googleMaps';

export const useLocationSuggestions = () => {
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [isLoadingOriginSuggestions, setIsLoadingOriginSuggestions] = useState(false);
  const [isLoadingDestinationSuggestions, setIsLoadingDestinationSuggestions] = useState(false);
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        setOriginSuggestions([]);
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
        setDestinationSuggestions([]);
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
    handleOriginChange,
    handleDestinationChange,
    selectOriginSuggestion,
    selectDestinationSuggestion,
    clearOriginSuggestions: () => setOriginSuggestions([]),
    clearDestinationSuggestions: () => setDestinationSuggestions([])
  };
};
