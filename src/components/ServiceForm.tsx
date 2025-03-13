
import React from 'react';
import { Button } from '@/components/ui/button';
import { useServiceForm } from '@/hooks/useServiceForm';
import { useLocationSuggestions } from '@/hooks/useLocationSuggestions';
import PersonalInfoSection from './service-form/PersonalInfoSection';
import ServiceTypeSelector from './service-form/ServiceTypeSelector';
import LocationField from './service-form/LocationField';
import ScheduleSection from './service-form/ScheduleSection';
import PassengersAndInfo from './service-form/PassengersAndInfo';

const ServiceForm: React.FC = () => {
  const {
    formData,
    date,
    time,
    isSubmitting,
    handleChange,
    handleServiceTypeChange,
    setDate,
    setTime,
    handleSubmit
  } = useServiceForm();

  const {
    originSuggestions,
    destinationSuggestions,
    handleOriginChange,
    handleDestinationChange,
    selectOriginSuggestion,
    selectDestinationSuggestion
  } = useLocationSuggestions();

  const handleOriginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    handleOriginChange(e.target.value);
  };

  const handleDestinationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    handleDestinationChange(e.target.value);
  };

  const handleOriginSelect = (suggestion: any) => {
    const placeName = selectOriginSuggestion(suggestion);
    // Update the form value with the selected place
    const mockEvent = {
      target: {
        name: 'origin',
        value: placeName
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleChange(mockEvent);
  };

  const handleDestinationSelect = (suggestion: any) => {
    const placeName = selectDestinationSuggestion(suggestion);
    // Update the form value with the selected place
    const mockEvent = {
      target: {
        name: 'destination',
        value: placeName
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleChange(mockEvent);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <PersonalInfoSection
          name={formData.name}
          email={formData.email}
          phone={formData.phone}
          onChange={handleChange}
        />
        
        <ServiceTypeSelector
          value={formData.serviceType}
          onChange={handleServiceTypeChange}
        />
        
        <LocationField
          id="origin"
          name="origin"
          label="Origem"
          value={formData.origin}
          placeholder="Digite o endereço de origem"
          onChange={handleOriginInputChange}
          suggestions={originSuggestions}
          onSelectSuggestion={handleOriginSelect}
        />
        
        <LocationField
          id="destination"
          name="destination"
          label="Destino"
          value={formData.destination}
          placeholder="Digite o endereço de destino"
          onChange={handleDestinationInputChange}
          suggestions={destinationSuggestions}
          onSelectSuggestion={handleDestinationSelect}
        />
        
        <ScheduleSection
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
        />
        
        <PassengersAndInfo
          passengers={formData.passengers}
          additionalInfo={formData.additionalInfo}
          onChange={handleChange}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Solicitar Serviço'}
      </Button>
    </form>
  );
};

export default ServiceForm;
