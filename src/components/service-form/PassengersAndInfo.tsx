
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users } from 'lucide-react';

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
    <>
      <div>
        <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-1">
          <Users className="h-4 w-4 inline mr-1" /> Número de Passageiros
        </label>
        <Input 
          id="passengers" 
          name="passengers" 
          type="number" 
          min="1"
          value={passengers} 
          onChange={onChange} 
          required
        />
      </div>
      
      <div>
        <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
          Informações Adicionais
        </label>
        <Textarea 
          id="additionalInfo" 
          name="additionalInfo" 
          value={additionalInfo} 
          onChange={onChange} 
          rows={4}
          placeholder="Bagagens, necessidades especiais, etc."
        />
      </div>
    </>
  );
};

export default PassengersAndInfo;
