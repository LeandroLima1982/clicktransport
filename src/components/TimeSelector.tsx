
import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  connected?: boolean;
  position?: "left" | "right" | "middle";
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  value,
  onChange,
  className,
  connected = false,
  position = "left"
}) => {
  // Geração de horários de 30 em 30 minutos
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      options.push(`${hour.toString().padStart(2, '0')}:00`);
      options.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return options;
  };

  const timeOptions = generateTimeOptions();
  
  const getBorderRadius = () => {
    switch(position) {
      case "left":
        return connected ? "rounded-l-lg rounded-r-none" : "rounded-lg";
      case "right":
        return connected ? "rounded-r-lg rounded-l-none" : "rounded-lg";
      case "middle":
        return connected ? "rounded-none" : "rounded-lg";
      default:
        return "rounded-lg";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          className={cn(
            `h-10 border border-gray-200 bg-white hover:bg-gray-50 
             focus:ring-1 focus:ring-blue-500 transition-colors`,
            getBorderRadius()
          )}
        >
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <SelectValue placeholder="Escolha o horário" />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-auto">
          {timeOptions.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimeSelector;
