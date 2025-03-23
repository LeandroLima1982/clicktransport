
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
  // centered around 7:00 AM
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
    
    // Find the index of 7:00 AM
    const sevenAmIndex = options.findIndex(time => time === '07:00');
    
    // Get times before 7:00 AM (in reverse order)
    const beforeSeven = options.slice(0, sevenAmIndex).reverse();
    
    // Get times from 7:00 AM onwards
    const fromSevenOnwards = options.slice(sevenAmIndex);
    
    // Interleave the times, starting with 7:00 AM and alternating before/after
    const reordered = [];
    
    // Start with 7:00 AM
    reordered.push(fromSevenOnwards[0]);
    
    // Add the rest in alternating order
    const maxLength = Math.max(beforeSeven.length, fromSevenOnwards.length - 1);
    for (let i = 0; i < maxLength; i++) {
      // Add a time before 7:00 AM if available
      if (i < beforeSeven.length) {
        reordered.push(beforeSeven[i]);
      }
      
      // Add a time after 7:00 AM if available
      if (i + 1 < fromSevenOnwards.length) {
        reordered.push(fromSevenOnwards[i + 1]);
      }
    }
    
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
