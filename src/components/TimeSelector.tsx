
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TimeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ value, onChange }) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  
  // Generate time options for a full 24 hour day in 30 minute intervals
  const generateTimeOptions = () => {
    const options = [];
    
    // Generate all hours from 00:00 to 23:30
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    
    // Reorder to start from 07:00 (move 00:00-06:30 to the end)
    const morningStart = options.findIndex(time => time === '07:00');
    const reordered = [...options.slice(morningStart), ...options.slice(0, morningStart)];
    
    return reordered;
  };

  const timeOptions = generateTimeOptions();

  const handleValueChange = (newValue: string) => {
    onChange(newValue);
    setOpen(false);
  };

  return (
    <Select value={value} onValueChange={handleValueChange} open={open} onOpenChange={setOpen}>
      <SelectTrigger 
        className="w-full py-6 rounded-lg border border-gray-100 shadow-sm bg-white hover:bg-white focus:border-amber-300 focus:ring-amber-300 text-gray-700"
      >
        <div className="flex items-center">
          <Clock className="mr-2 h-5 w-5 text-amber-400" />
          {value ? (
            <span className="flex items-center">
              {value}
            </span>
          ) : (
            <span className="flex items-center text-gray-400">
              Selecione o horário
            </span>
          )}
        </div>
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
