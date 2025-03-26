import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
interface TripTypeTabsProps {
  value: 'oneway' | 'roundtrip';
  onChange: (value: 'oneway' | 'roundtrip') => void;
}
const TripTypeTabs: React.FC<TripTypeTabsProps> = ({
  value,
  onChange
}) => {
  return <ToggleGroup type="single" value={value} onValueChange={val => val && onChange(val as 'oneway' | 'roundtrip')} className="p-1 rounded-full px-[6px] py-[6px] bg-yellow-500">
      <ToggleGroupItem value="oneway" className="rounded-full text-sm px-4 py-1.5 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-amber-800 transition-colors">
        Somente Ida
      </ToggleGroupItem>
      <ToggleGroupItem value="roundtrip" className="rounded-full text-sm px-4 py-1.5 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-amber-800 transition-colors">
        Ida e Volta
      </ToggleGroupItem>
    </ToggleGroup>;
};
export default TripTypeTabs;