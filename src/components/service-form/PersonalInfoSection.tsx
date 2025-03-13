
import React from 'react';
import { Input } from '@/components/ui/input';

interface PersonalInfoSectionProps {
  name: string;
  email: string;
  phone: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  name,
  email,
  phone,
  onChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
        <Input 
          id="name" 
          name="name" 
          value={name} 
          onChange={onChange} 
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          value={email} 
          onChange={onChange} 
          required
        />
      </div>
      
      <div className="md:col-span-2">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
        <Input 
          id="phone" 
          name="phone" 
          value={phone} 
          onChange={onChange} 
          required
        />
      </div>
    </div>
  );
};

export default PersonalInfoSection;
