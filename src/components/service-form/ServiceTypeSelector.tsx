
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ServiceTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ServiceTypeSelector: React.FC<ServiceTypeSelectorProps> = ({
  value,
  onChange
}) => {
  return (
    <div>
      <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Serviço</label>
      <Select 
        name="serviceType" 
        value={value} 
        onValueChange={onChange}
      >
        <SelectTrigger id="serviceType">
          <SelectValue placeholder="Selecione o tipo de serviço" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="transfer">Transfer</SelectItem>
          <SelectItem value="dayRent">Diária</SelectItem>
          <SelectItem value="tourism">Turismo</SelectItem>
          <SelectItem value="event">Evento</SelectItem>
          <SelectItem value="other">Outro</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ServiceTypeSelector;
