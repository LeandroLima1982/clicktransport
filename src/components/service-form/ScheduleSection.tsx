
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import TimeSelector from '../TimeSelector';

interface ScheduleSectionProps {
  date: Date | undefined;
  time: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  date,
  time,
  onDateChange,
  onTimeChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <CalendarIcon className="h-4 w-4 inline mr-1" /> Data
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              {date ? format(date, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <CalendarIcon className="h-4 w-4 inline mr-1" /> Horário
        </label>
        <TimeSelector value={time} onChange={onTimeChange} />
      </div>
    </div>
  );
};

export default ScheduleSection;
