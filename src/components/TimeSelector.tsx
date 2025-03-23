
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TimeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  connected?: boolean;
  position?: 'left' | 'right';
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ 
  value, 
  onChange, 
  connected = false,
  position = 'left'
}) => {
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

  // Define classes for connected appearance
  const getConnectedClasses = () => {
    if (!connected) return '';
    
    return position === 'left' 
      ? 'rounded-r-none border-r-0' 
      : 'rounded-l-none border-l-0';
  };

  return (
    <Select value={value} onValueChange={handleValueChange} open={open} onOpenChange={setOpen}>
      <SelectTrigger 
        className={`w-full py-5 md:py-6 border border-gray-100 shadow-sm bg-white hover:bg-white focus:border-amber-300 focus:ring-amber-300 text-gray-700 ${getConnectedClasses()}`}
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
      <SelectContent className="max-h-[300px]" position={isMobile ? "popper" : "item-aligned"} sideOffset={5}>
        <div className="py-1 px-2 bg-amber-50/80 border-b border-amber-100 sticky top-0 z-10 text-xs font-medium text-amber-700">
          Manhã (7:00 - 11:30)
        </div>
        {timeOptions.slice(0, 10).map((time) => (
          <SelectItem key={time} value={time} className="cursor-pointer hover:bg-amber-50">
            {time}
          </SelectItem>
        ))}
        
        <div className="py-1 px-2 bg-amber-50/80 border-b border-amber-100 sticky top-[34px] z-10 text-xs font-medium text-amber-700">
          Tarde (12:00 - 17:30)
        </div>
        {timeOptions.slice(10, 22).map((time) => (
          <SelectItem key={time} value={time} className="cursor-pointer hover:bg-amber-50">
            {time}
          </SelectItem>
        ))}
        
        <div className="py-1 px-2 bg-amber-50/80 border-b border-amber-100 sticky top-[68px] z-10 text-xs font-medium text-amber-700">
          Noite (18:00 - 23:30)
        </div>
        {timeOptions.slice(22, 34).map((time) => (
          <SelectItem key={time} value={time} className="cursor-pointer hover:bg-amber-50">
            {time}
          </SelectItem>
        ))}
        
        <div className="py-1 px-2 bg-amber-50/80 border-b border-amber-100 sticky top-[102px] z-10 text-xs font-medium text-amber-700">
          Madrugada (00:00 - 06:30)
        </div>
        {timeOptions.slice(34).map((time) => (
          <SelectItem key={time} value={time} className="cursor-pointer hover:bg-amber-50">
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TimeSelector;
