import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import TransitionEffect from '@/components/TransitionEffect';
interface PassengerSelectorProps {
  value: string;
  onChange: (value: string) => void;
}
const PassengerSelector: React.FC<PassengerSelectorProps> = ({
  value,
  onChange
}) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  // Generate passenger options from 1 to 10
  const passengerOptions = Array.from({
    length: 10
  }, (_, i) => (i + 1).toString());
  const handleValueChange = (newValue: string) => {
    onChange(newValue);
    setOpen(false);
  };
  return <TransitionEffect direction="fade" delay={250}>
      <div className="space-y-2">
        <label className="text-white block text-sm">
          Passageiros
        </label>
        <Select value={value} onValueChange={handleValueChange} open={open} onOpenChange={setOpen}>
          <SelectTrigger className="w-full py-5 md:py-6 rounded-lg border border-gray-200 shadow-sm bg-white/95 focus:border-amber-300 focus:ring-amber-300 text-gray-700 transition-all duration-200 hover:border-amber-200">
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-amber-400" />
              {value ? <span className="flex items-center">
                  {value} {parseInt(value) === 1 ? 'passageiro' : 'passageiros'}
                </span> : <span className="flex items-center text-gray-400">
                  Nº de passageiros
                </span>}
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[200px] bg-white shadow-lg border border-gray-200 z-50">
            {passengerOptions.map(num => <SelectItem key={num} value={num} className="cursor-pointer hover:bg-amber-50 py-3 transition-colors">
                {num} {parseInt(num) === 1 ? 'passageiro' : 'passageiros'}
              </SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </TransitionEffect>;
};
export default PassengerSelector;