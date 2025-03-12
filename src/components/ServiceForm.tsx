import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Clock, MapPin, Users } from 'lucide-react';
import { useServiceRequests } from '@/hooks/useServiceRequests';
import TimeSelector from './TimeSelector';
import { toast } from 'sonner';
import { fetchAddressSuggestions, getPlaceIcon, formatPlaceName } from '@/utils/mapbox';
const ServiceForm: React.FC = () => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    origin: '',
    destination: '',
    passengers: '',
    additionalInfo: ''
  });
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {
    submitServiceRequest,
    isSubmitting
  } = useServiceRequests();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Trigger address suggestions for origin and destination fields
    if (name === 'origin') {
      if (originTimeoutRef.current) {
        clearTimeout(originTimeoutRef.current);
      }
      originTimeoutRef.current = setTimeout(async () => {
        setIsLoadingSuggestions(true);
        const suggestions = await fetchAddressSuggestions(value);
        setOriginSuggestions(suggestions);
        setIsLoadingSuggestions(false);
      }, 500);
    }
    if (name === 'destination') {
      if (destinationTimeoutRef.current) {
        clearTimeout(destinationTimeoutRef.current);
      }
      destinationTimeoutRef.current = setTimeout(async () => {
        setIsLoadingSuggestions(true);
        const suggestions = await fetchAddressSuggestions(value);
        setDestinationSuggestions(suggestions);
        setIsLoadingSuggestions(false);
      }, 500);
    }
  };
  const selectSuggestion = (suggestion: any, isOrigin: boolean) => {
    const placeName = suggestion.place_name;
    if (isOrigin) {
      setFormData(prev => ({
        ...prev,
        origin: placeName
      }));
      setOriginSuggestions([]);
    } else {
      setFormData(prev => ({
        ...prev,
        destination: placeName
      }));
      setDestinationSuggestions([]);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare data for submission
    const requestData = {
      ...formData,
      requestDate: date ? format(date, 'yyyy-MM-dd') : '',
      requestTime: time
    };

    // Submit to Supabase
    const success = await submitServiceRequest(requestData);

    // Reset form if submission was successful
    if (success) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        serviceType: '',
        origin: '',
        destination: '',
        passengers: '',
        additionalInfo: ''
      });
      setDate(undefined);
      setTime('');
    }
  };

  // Fixed: Return JSX instead of void
  return;
};
export default ServiceForm;