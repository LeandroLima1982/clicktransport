
import { useState, useRef, useEffect } from 'react';
import { getSuggestions } from '@/services/booking/locationSuggestionService';
import { BookingAddressState, LocationSuggestion } from '@/types/booking.types';

export const useBookingAddress = () => {
  const [state, setState] = useState<BookingAddressState>({
    originValue: '',
    destinationValue: '',
    originNumber: '',
    destinationNumber: '',
    originSuggestions: [],
    destinationSuggestions: [],
    isLoadingSuggestions: false
  });
  
  const [errorCount, setErrorCount] = useState(0);
  
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset error count after a period to allow retrying
  useEffect(() => {
    if (errorCount > 0) {
      const timer = setTimeout(() => {
        setErrorCount(0);
      }, 30000); // Reset after 30 seconds
      
      return () => clearTimeout(timer);
    }
  }, [errorCount]);
  
  const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setState(prev => ({ ...prev, originValue: value }));
    
    if (originTimeoutRef.current) {
      clearTimeout(originTimeoutRef.current);
    }
    
    if (value.length >= 3 && errorCount < 5) {
      setState(prev => ({ ...prev, isLoadingSuggestions: true }));
      
      originTimeoutRef.current = setTimeout(async () => {
        try {
          const suggestions = await getSuggestions(value, errorCount);
          setState(prev => ({ ...prev, originSuggestions: suggestions, isLoadingSuggestions: false }));
          
          if (suggestions.length === 0 && value.length > 5) {
            console.log("Sem resultados para: " + value);
          }
        } catch (error) {
          setState(prev => ({ ...prev, isLoadingSuggestions: false }));
          setErrorCount(prev => prev + 1);
        }
      }, 300);
    } else {
      setState(prev => ({ ...prev, originSuggestions: [] }));
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setState(prev => ({ ...prev, destinationValue: value }));
    
    if (destinationTimeoutRef.current) {
      clearTimeout(destinationTimeoutRef.current);
    }
    
    if (value.length >= 3 && errorCount < 5) {
      setState(prev => ({ ...prev, isLoadingSuggestions: true }));
      
      destinationTimeoutRef.current = setTimeout(async () => {
        try {
          const suggestions = await getSuggestions(value, errorCount);
          setState(prev => ({ ...prev, destinationSuggestions: suggestions, isLoadingSuggestions: false }));
        } catch (error) {
          setState(prev => ({ ...prev, isLoadingSuggestions: false }));
          setErrorCount(prev => prev + 1);
        }
      }, 300);
    } else {
      setState(prev => ({ ...prev, destinationSuggestions: [] }));
    }
  };

  const handleOriginNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, originNumber: e.target.value }));
  };

  const handleDestinationNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, destinationNumber: e.target.value }));
  };

  const selectSuggestion = (suggestion: LocationSuggestion, isOrigin: boolean) => {
    const placeName = suggestion.place_name;
    if (isOrigin) {
      setState(prev => ({
        ...prev,
        originValue: placeName,
        originSuggestions: []
      }));
    } else {
      setState(prev => ({
        ...prev,
        destinationValue: placeName,
        destinationSuggestions: []
      }));
    }
  };

  const clearOrigin = () => {
    setState(prev => ({
      ...prev,
      originValue: '',
      originNumber: '',
      originSuggestions: []
    }));
  };

  const clearDestination = () => {
    setState(prev => ({
      ...prev,
      destinationValue: '',
      destinationNumber: '',
      destinationSuggestions: []
    }));
  };

  const setOriginValue = (value: string) => {
    setState(prev => ({ ...prev, originValue: value }));
  };

  const setDestinationValue = (value: string) => {
    setState(prev => ({ ...prev, destinationValue: value }));
  };

  return {
    ...state,
    setOriginValue,
    setDestinationValue,
    handleOriginChange,
    handleDestinationChange,
    handleOriginNumberChange,
    handleDestinationNumberChange,
    selectSuggestion,
    clearOrigin,
    clearDestination
  };
};
