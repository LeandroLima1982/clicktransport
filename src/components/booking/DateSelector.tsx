
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface DateSelectorProps {
  label: string;
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  disabledDates?: (date: Date) => boolean;
  isConnected?: boolean;
  position?: 'left' | 'right';
}

const DateSelector: React.FC<DateSelectorProps> = ({
  label,
  date,
  onSelect,
  disabledDates,
  isConnected = false,
  position = 'left'
}) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // Handle date selection and auto-close
  const handleSelect = (newDate: Date | undefined) => {
    onSelect(newDate);
    setOpen(false);
  };
  
  // Define classes for connected appearance
  const getConnectedClasses = () => {
    if (!isConnected) return '';
    
    return position === 'left' 
      ? 'md:rounded-r-none md:border-r-0' 
      : 'md:rounded-l-none md:border-l-0';
  };
  
  return (
    <div className="space-y-2">
      <Label className="text-gray-700 block text-sm font-medium">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={`w-full justify-start text-left font-normal py-6 rounded-lg border border-gray-100 shadow-sm bg-white hover:bg-white focus:border-amber-300 focus:ring-amber-300 text-gray-700 ${getConnectedClasses()}`}
          >
            <CalendarIcon className="mr-2 h-5 w-5 text-amber-400" />
            {date ? (
              format(date, "dd/MM/yyyy", { locale: ptBR })
            ) : (
              <span className="text-gray-400">Selecione uma data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={isMobile ? "center" : "start"}>
          <Calendar 
            mode="single" 
            selected={date} 
            onSelect={handleSelect} 
            initialFocus 
            className={cn("p-3 pointer-events-auto")}
            disabled={disabledDates}
            locale={ptBR}
            classNames={{
              day_selected: "bg-amber-400 text-amber-900 hover:bg-amber-400 hover:text-amber-900 focus:bg-amber-400 focus:text-amber-900",
              day_today: "bg-amber-100 text-amber-800",
              nav_button_previous: "hover:bg-amber-50",
              nav_button_next: "hover:bg-amber-50",
              caption: "text-amber-800",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateSelector;
