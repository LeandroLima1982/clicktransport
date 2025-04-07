
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { assignCompanyFromQueue } from '@/services/booking/queueManagementService';
import { toast } from 'sonner';

export const useServiceRequests = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitServiceRequest = async (requestData: any) => {
    setIsSubmitting(true);
    try {
      const { name, email, phone, serviceType, origin, destination, passengers, additionalInfo, requestDate, requestTime, userId } = requestData;

      // Validate required fields
      if (!name || !email || !phone || !serviceType || !origin || !destination || !passengers || !requestDate || !requestTime) {
        toast.error("Por favor, preencha todos os campos obrigatórios.");
        setIsSubmitting(false);
        return false;
      }

      // Create a booking object
      const booking = {
        client_name: name,
        client_email: email,
        client_phone: phone,
        service_type: serviceType,
        origin: origin,
        destination: destination,
        passengers: parseInt(passengers),
        additional_notes: additionalInfo,
        booking_date: requestDate + ' ' + requestTime,
        user_id: userId,
        status: 'pending',
        reference_code: 'REQ-' + Math.floor(100000 + Math.random() * 900000),
        total_price: 0,  // Add required fields
        travel_date: new Date().toISOString()
      };

      // Insert the booking into the database
      const { data, error } = await supabase
        .from('bookings')
        .insert([booking])
        .select();

      if (error) {
        console.error("Error submitting service request:", error);
        toast.error("Ocorreu um erro ao solicitar o serviço. Por favor, tente novamente.");
        setIsSubmitting(false);
        return false;
      }

      if (!data || data.length === 0) {
        toast.error("Ocorreu um erro ao solicitar o serviço. Por favor, tente novamente.");
        setIsSubmitting(false);
        return false;
      }

      // Assign company from queue
      const queueResult = await assignCompanyFromQueue(data[0].id);
      const assignedCompanyId = queueResult.companyId;
      const assignError = queueResult.error;
    
      if (assignError) {
        console.error('Error assigning company from queue:', assignError);
      }

      // If we got a company id assigned, refresh the booking
      if (typeof assignedCompanyId === 'string' && assignedCompanyId) {
        const { data: updatedBooking } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', data[0].id)
          .single();
        
        if (updatedBooking) {
          Object.assign(booking, updatedBooking);
        }
      }

      toast.success("Solicitação de serviço enviada com sucesso!");
      setIsSubmitting(false);
      return true;

    } catch (err: any) {
      console.error("Error submitting service request:", err);
      toast.error("Ocorreu um erro ao solicitar o serviço. Por favor, tente novamente.");
      setIsSubmitting(false);
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
