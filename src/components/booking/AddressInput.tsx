
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface AddressInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddressInput: React.FC<AddressInputProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-700 block text-sm font-medium">
        {label}
      </Label>
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <MapPin className="h-4 w-4 text-amber-400" />
        </div>
        
        <Input 
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="pl-9 py-2.5 text-sm md:h-11 rounded-lg border border-gray-100 shadow-sm bg-white focus:border-amber-300 focus:ring-amber-300 text-gray-700"
        />
      </div>
    </div>
  );
};

export default AddressInput;
