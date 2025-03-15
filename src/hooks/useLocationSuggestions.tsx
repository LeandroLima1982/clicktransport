
import { useState, useRef } from 'react';
import { fetchAddressSuggestions } from '@/utils/mapbox';

export const useLocationSuggestions = () => {
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleOriginChange = (value: string) => {
    if (originTimeoutRef.current) {
      clearTimeout(originTimeoutRef.current);
    }
    
    originTimeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      const suggestions = await fetchAddressSuggestions(value);
      setOriginSuggestions(suggestions);
      setIsLoadingSuggestions(false);
    }, 500);
  };

  const handleDestinationChange = (value: string) => {
    if (destinationTimeoutRef.current) {
      clearTimeout(destinationTimeoutRef.current);
    }
    
    destinationTimeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      const suggestions = await fetchAddressSuggestions(value);
      setDestinationSuggestions(suggestions);
      setIsLoadingSuggestions(false);
    }, 500);
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
