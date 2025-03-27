
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useIsMobile } from '@/hooks/use-mobile';
import TransitionEffect from '@/components/TransitionEffect';

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
    <TransitionEffect direction="fade" delay={150}>
      <ToggleGroup 
        type="single" 
        value={value} 
        onValueChange={val => val && onChange(val as 'oneway' | 'roundtrip')} 
        className="p-1 rounded-full bg-yellow-500 py-[5px] my-[21px] mx-auto md:mx-[33px] px-[12px] max-w-[90%] md:max-w-full flex justify-center"
      >
        <ToggleGroupItem 
          value="oneway" 
          className="rounded-full text-sm py-1.5 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-amber-800 transition-colors px-[20px] md:px-[29px] flex-1 md:flex-none"
        >
          Somente Ida
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="roundtrip" 
          className="rounded-full text-sm px-4 py-1.5 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-amber-800 transition-colors flex-1 md:flex-none"
        >
          Ida e Volta
        </ToggleGroupItem>
      </ToggleGroup>
    </TransitionEffect>
  );
};

export default TripTypeTabs;
