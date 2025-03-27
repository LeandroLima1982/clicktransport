
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useIsMobile } from '@/hooks/use-mobile';

interface TripTypeTabsProps {
  value: 'oneway' | 'roundtrip';
  onChange: (value: 'oneway' | 'roundtrip') => void;
}

const TripTypeTabs: React.FC<TripTypeTabsProps> = ({
  value,
  onChange
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="my-1 md:my-[21px]">
      <ToggleGroup 
        type="single" 
        value={value} 
        onValueChange={val => val && onChange(val as 'oneway' | 'roundtrip')} 
        className={`p-1 rounded-full bg-yellow-500 py-[5px] mx-auto md:mx-[33px] px-[12px] shadow-md transition-all duration-300`}
      >
        <ToggleGroupItem 
          value="oneway" 
          className="rounded-full text-sm md:text-base py-1.5 px-4 md:px-[29px] data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-amber-800 transition-colors"
        >
          {isMobile ? 'Ida' : 'Somente Ida'}
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="roundtrip" 
          className="rounded-full text-sm md:text-base py-1.5 px-4 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-amber-800 transition-colors"
        >
          {isMobile ? 'Ida e Volta' : 'Ida e Volta'}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default TripTypeTabs;
