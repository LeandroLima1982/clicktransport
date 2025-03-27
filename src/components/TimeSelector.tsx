
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
  
  // Generate time options for common hours first, then all other times
  const generateTimeOptions = () => {
    // Most common travel times
    const primaryOptions = ['08:00', '09:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const allOptions = [];
    
    // Generate all hours from 00:00 to 23:30 in sequential order
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const timeOption = `${formattedHour}:${formattedMinute}`;
        
        // Only add if not already in primary options
        if (!primaryOptions.includes(timeOption)) {
          allOptions.push(timeOption);
        }
      }
    }
    
    // Return primary options first, then all others
    return [...primaryOptions, ...allOptions];
  };

  const timeOptions = generateTimeOptions();
  // Split the options into popular and all other times
  const popularTimes = timeOptions.slice(0, 8);
  const otherTimes = timeOptions.slice(8);

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
    <div className="relative w-full">
      <Select value={value} onValueChange={handleValueChange} open={open} onOpenChange={setOpen}>
        <SelectTrigger 
          className={`w-full py-5 md:py-6 border border-gray-200/30 shadow-sm bg-white/95 
                     hover:bg-white focus:border-amber-300 focus:ring-amber-300 text-gray-700 
                     transition-all duration-200 hover:border-amber-200 ${getConnectedClasses()}`}
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
        <SelectContent 
          className="max-h-[300px]" 
          position="popper" 
          align="start"
          side="bottom"
          sideOffset={0}
        >
          <div className="py-1">
            <div className="px-2 py-1 text-xs font-semibold text-gray-500">Horários populares</div>
            {popularTimes.map((time) => (
              <SelectItem key={time} value={time} className="cursor-pointer hover:bg-amber-50">
                {time}
              </SelectItem>
            ))}
            
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 mt-2">Todos os horários</div>
            {otherTimes.map((time) => (
              <SelectItem key={time} value={time} className="cursor-pointer hover:bg-amber-50">
                {time}
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimeSelector;
