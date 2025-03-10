
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

interface TimeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ value, onChange }) => {
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
      <SelectTrigger className="bg-white/20 border-white/10 text-white focus:ring-primary focus:border-primary">
        <SelectValue placeholder="Selecione o horário">
          {value || (
            <span className="flex items-center text-white/60">
              <Clock className="w-4 h-4 mr-2 opacity-60" /> Selecione o horário
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[200px]">
        {timeOptions.map((time) => (
          <SelectItem key={time} value={time}>
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TimeSelector;
