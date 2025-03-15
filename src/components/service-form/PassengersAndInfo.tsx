
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users, Info } from 'lucide-react';

interface PassengersAndInfoProps {
  passengers: string;
  additionalInfo: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const PassengersAndInfo: React.FC<PassengersAndInfoProps> = ({
  passengers,
  additionalInfo,
  onChange
}) => {
  return (
    <div className="space-y-3 md:space-y-4 w-full">
      <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
        <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-1 md:mb-2 flex items-center">
          <Users className="h-4 w-4 mr-1 text-gray-500" /> Número de Passageiros
        </label>
        <Input 
          id="passengers" 
          name="passengers" 
          type="number" 
          min="1"
          value={passengers} 
          onChange={onChange} 
          className="border-gray-200 focus:border-primary focus:ring-primary w-full h-12"
          placeholder="1"
          required
        />
      </div>
      
      <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
        <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1 md:mb-2 flex items-center">
          <Info className="h-4 w-4 mr-1 text-gray-500" /> Informações Adicionais
        </label>
        <Textarea 
          id="additionalInfo" 
          name="additionalInfo" 
          value={additionalInfo} 
          onChange={onChange} 
          rows={4}
          className="border-gray-200 focus:border-primary focus:ring-primary w-full"
          placeholder="Bagagens, necessidades especiais, horários flexíveis, etc."
        />
      </div>
    </div>
  );
};

export default PassengersAndInfo;
