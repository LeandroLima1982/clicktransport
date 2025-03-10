
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  label: string;
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  disabledDates?: (date: Date) => boolean;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  label,
  date,
  onSelect,
  disabledDates
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-gray-700 flex items-center text-sm font-medium">
        {label}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal py-6 pl-10 rounded-lg border-gray-200 text-gray-500"
          >
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : <span>Data e hora</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
            disabled={disabledDates}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateSelector;
