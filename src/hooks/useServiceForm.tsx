
import { useState } from 'react';
import { useServiceRequests } from '@/hooks/useServiceRequests';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';

type ServiceFormData = {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  origin: string;
  destination: string;
  passengers: string;
  additionalInfo: string;
};

const initialFormData: ServiceFormData = {
  name: '',
  email: '',
  phone: '',
  serviceType: '',
  origin: '',
  destination: '',
  passengers: '',
  additionalInfo: ''
};

export const useServiceForm = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>('');
  const [formData, setFormData] = useState<ServiceFormData>(initialFormData);
  
  const { submitServiceRequest, isSubmitting } = useServiceRequests();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, serviceType: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setDate(undefined);
    setTime('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Você precisa estar logado para solicitar um serviço");
      return;
    }

    const requestData = {
      ...formData,
      requestDate: date ? format(date, 'yyyy-MM-dd') : '',
      requestTime: time,
      userId: user.id
    };

    const success = await submitServiceRequest(requestData);

    if (success) {
      resetForm();
    }
  };

  return {
    formData,
    date,
    time,
    isSubmitting,
    handleChange,
    handleServiceTypeChange,
    setDate,
    setTime,
    handleSubmit
  };
};
