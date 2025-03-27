
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DateSelectorProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  disabledDates?: (date: Date) => boolean;
  isConnected?: boolean;
  position?: "left" | "right" | "middle";
  className?: string;
  hideLabel?: boolean;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  date,
  onSelect,
  disabledDates,
  isConnected = false,
  position = "left",
  className,
  hideLabel = false
}) => {
  const [open, setOpen] = useState(false);

  const formatDisplayDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };
  
  const getBorderRadius = () => {
    switch(position) {
      case "left":
        return isConnected ? "rounded-l-lg rounded-r-none" : "rounded-lg";
      case "right":
        return isConnected ? "rounded-r-lg rounded-l-none" : "rounded-lg";
      case "middle":
        return isConnected ? "rounded-none" : "rounded-lg";
      default:
        return "rounded-lg";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {!hideLabel && <div className="text-sm font-medium mb-1.5">Data</div>}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              `w-full h-10 pl-3 pr-2 text-left font-normal border border-gray-200
               bg-white hover:bg-gray-50 focus:ring-1 focus:ring-blue-500
               transition-colors justify-between items-center`,
              getBorderRadius(),
              !date && "text-gray-500"
            )}
          >
            {date ? formatDisplayDate(date) : "Selecionar data"}
            <CalendarIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-auto p-0 bg-white rounded-lg shadow-lg" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              onSelect(newDate);
              setOpen(false);
            }}
            disabled={disabledDates}
            locale={ptBR}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateSelector;
