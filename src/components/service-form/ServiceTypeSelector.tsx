
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, CalendarDays, Map, PartyPopper, CircleEllipsis } from 'lucide-react';

interface ServiceTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ServiceTypeSelector: React.FC<ServiceTypeSelectorProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="mb-4">
      <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">Tipo de Serviço</label>
      <Select 
        name="serviceType" 
        value={value} 
        onValueChange={onChange}
      >
        <SelectTrigger id="serviceType" className="w-full border border-gray-200 rounded-md">
          <SelectValue placeholder="Selecione o tipo de serviço" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="transfer" className="flex items-center py-2.5">
            <div className="flex items-center">
              <Car className="h-4 w-4 mr-2 text-primary" />
              <span>Transfer</span>
            </div>
          </SelectItem>
          <SelectItem value="dayRent" className="flex items-center py-2.5">
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-2 text-primary" />
              <span>Diária</span>
            </div>
          </SelectItem>
          <SelectItem value="tourism" className="flex items-center py-2.5">
            <div className="flex items-center">
              <Map className="h-4 w-4 mr-2 text-primary" />
              <span>Turismo</span>
            </div>
          </SelectItem>
          <SelectItem value="event" className="flex items-center py-2.5">
            <div className="flex items-center">
              <PartyPopper className="h-4 w-4 mr-2 text-primary" />
              <span>Evento</span>
            </div>
          </SelectItem>
          <SelectItem value="other" className="flex items-center py-2.5">
            <div className="flex items-center">
              <CircleEllipsis className="h-4 w-4 mr-2 text-primary" />
              <span>Outro</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ServiceTypeSelector;
