
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CitySelectorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  cities: { id: string; name: string }[];
}

const CitySelector: React.FC<CitySelectorProps> = ({
  id,
  label,
  value,
  onChange,
  cities
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-700 block text-sm font-medium">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full py-2.5 text-sm md:h-11 rounded-lg border border-gray-100 shadow-sm bg-white">
          <SelectValue placeholder="Selecione a cidade" />
        </SelectTrigger>
        <SelectContent>
          {cities.map((city) => (
            <SelectItem key={city.id} value={city.id}>
              {city.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CitySelector;
