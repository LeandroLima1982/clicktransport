
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PassengerSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const PassengerSelector: React.FC<PassengerSelectorProps> = ({ value, onChange }) => {
  const isMobile = useIsMobile();
  
  // Generate passenger options from 1 to 10
  const passengerOptions = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

  return (
    <div className="space-y-2">
      <label className="text-gray-700 block text-sm font-medium">
        Passageiros
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          className="w-full py-6 pl-10 rounded-lg border border-gray-100 shadow-sm bg-white focus:border-amber-300 focus:ring-amber-300 text-gray-700 relative"
        >
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-400" />
          <SelectValue placeholder="Nº de passageiros">
            {value ? (
              <span className="flex items-center">
                {value} {parseInt(value) === 1 ? 'passageiro' : 'passageiros'}
              </span>
            ) : (
              <span className="flex items-center text-gray-400">
                Nº de passageiros
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {passengerOptions.map((num) => (
            <SelectItem key={num} value={num} className="cursor-pointer hover:bg-amber-50">
              {num} {parseInt(num) === 1 ? 'passageiro' : 'passageiros'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PassengerSelector;
