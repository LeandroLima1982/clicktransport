
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
      <div className="glass-switch rounded-full px-1.5 py-1 border border-white/30 shadow-lg mx-auto max-w-[200px] md:max-w-[220px] flex justify-center">
        <ToggleGroup 
          type="single" 
          value={value} 
          onValueChange={val => val && onChange(val as 'oneway' | 'roundtrip')} 
          className="w-full flex"
        >
          <ToggleGroupItem 
            value="oneway" 
            className="rounded-full text-xs md:text-sm py-1 flex-1 data-[state=on]:bg-[#F8D748] data-[state=on]:shadow-md data-[state=on]:text-amber-900 transition-all duration-200 data-[state=on]:font-medium text-white"
          >
            Ida
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="roundtrip" 
            className="rounded-full text-xs md:text-sm py-1 flex-1 data-[state=on]:bg-[#F8D748] data-[state=on]:shadow-md data-[state=on]:text-amber-900 transition-all duration-200 data-[state=on]:font-medium text-white"
          >
            Ida e Volta
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </TransitionEffect>
  );
};

export default TripTypeTabs;
