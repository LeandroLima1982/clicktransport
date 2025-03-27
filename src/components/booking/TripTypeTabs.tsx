
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
      <div className="glass-switch rounded-full px-1.5 py-1 border border-amber-300 shadow-lg w-full max-w-[180px] md:max-w-[200px] flex justify-center mx-auto animate-float">
        <ToggleGroup 
          type="single" 
          value={value} 
          onValueChange={val => val && onChange(val as 'oneway' | 'roundtrip')} 
          className="w-full flex"
        >
          <ToggleGroupItem 
            value="oneway" 
            className="text-xs md:text-sm py-1.5 flex-1 data-[state=on]:shadow-md transition-all duration-200 
                      data-[state=on]:font-medium font-medium bg-gradient-to-r from-amber-500 to-amber-400 
                      hover:from-amber-400 hover:to-amber-300 rounded-full text-[#002366] data-[state=on]:scale-105"
          >
            Agendar sua Ida
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="roundtrip" 
            className="rounded-full text-xs md:text-sm py-1.5 flex-1 data-[state=on]:bg-gradient-to-r 
                      data-[state=on]:from-[#F8D748] data-[state=on]:to-amber-400 data-[state=on]:shadow-md 
                      data-[state=on]:text-[#002366] transition-all duration-200 data-[state=on]:font-medium 
                      text-white font-medium data-[state=on]:scale-105"
          >
            Ida e Volta
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </TransitionEffect>
  );
};

export default TripTypeTabs;
