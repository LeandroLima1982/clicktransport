
import { useState } from 'react';
import { supabase } from '../main';
import { toast } from 'sonner';

export interface ServiceRequest {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  origin: string;
  destination: string;
  passengers: string;
  requestDate: string;
  additionalInfo?: string;
}

export const useServiceRequests = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitServiceRequest = async (data: ServiceRequest) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('service_requests')
        .insert([data]);

      if (error) {
        console.error('Error submitting service request:', error);
        toast.error('Erro ao enviar solicitação', {
          description: error.message,
        });
        return false;
      }

      toast.success('Solicitação enviada com sucesso!', {
        description: 'Uma empresa de transporte entrará em contato em breve.',
      });
      return true;
    } catch (err) {
      console.error('Error submitting service request:', err);
      toast.error('Erro ao enviar solicitação');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitServiceRequest,
    isSubmitting
  };
};
