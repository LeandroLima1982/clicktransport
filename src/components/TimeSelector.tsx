
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TimeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ value, onChange }) => {
  const isMobile = useIsMobile();
  
  // Generate time options in 30 minute intervals from 00:00 to 23:30
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger 
        className="w-full py-6 pl-10 rounded-lg border border-gray-100 shadow-sm bg-white hover:bg-white focus:border-amber-300 focus:ring-amber-300 text-gray-700 relative"
      >
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-400" />
        <SelectValue placeholder="Selecione o horário">
          {value ? (
            <span className="flex items-center">
              {value}
            </span>
          ) : (
            <span className="flex items-center text-gray-400">
              Selecione o horário
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[200px]">
        {timeOptions.map((time) => (
          <SelectItem key={time} value={time} className="cursor-pointer hover:bg-amber-50">
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TimeSelector;
