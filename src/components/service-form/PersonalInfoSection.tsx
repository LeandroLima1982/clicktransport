
import React from 'react';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone } from 'lucide-react';

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg mb-4 w-full">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          <User className="h-4 w-4 mr-1 text-gray-500" /> Nome
        </label>
        <Input 
          id="name" 
          name="name" 
          value={name} 
          onChange={onChange} 
          className="border-gray-200 focus:border-primary focus:ring-primary w-full"
          placeholder="Seu nome completo"
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          <Mail className="h-4 w-4 mr-1 text-gray-500" /> Email
        </label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          value={email}
          placeholder="seu@email.com" 
          onChange={onChange} 
          className="border-gray-200 focus:border-primary focus:ring-primary w-full"
          required
        />
      </div>
      
      <div className="md:col-span-2">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          <Phone className="h-4 w-4 mr-1 text-gray-500" /> Telefone
        </label>
        <Input 
          id="phone" 
          name="phone" 
          value={phone} 
          onChange={onChange}
          placeholder="(00) 00000-0000"
          className="border-gray-200 focus:border-primary focus:ring-primary w-full" 
          required
        />
      </div>
    </div>
  );
};

export default PersonalInfoSection;
