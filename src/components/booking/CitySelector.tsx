
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { City } from '@/services/db/cityService';
import { Skeleton } from '@/components/ui/skeleton';

interface CitySelectorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  cities: City[];
  isLoading?: boolean;
}

const CitySelector: React.FC<CitySelectorProps> = ({
  id,
  label,
  value,
  onChange,
  cities,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    );
  }

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
              {city.name}{city.state ? `, ${city.state}` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CitySelector;
