
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useIsMobile } from '@/hooks/use-mobile';
import TransitionEffect from '@/components/TransitionEffect';
import { Route, ArrowRight } from 'lucide-react';

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
      <div className="flex justify-center">
        <ToggleGroup 
          type="single" 
          value={value} 
          onValueChange={(val) => val && onChange(val as 'oneway' | 'roundtrip')}
          className="bg-white/10 p-0.5 rounded-lg border border-[#D4AF37]/40 shadow-inner"
        >
          <ToggleGroupItem 
            value="oneway" 
            className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${
              value === 'oneway' 
                ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-[#002366] font-medium shadow-md'
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            <Route className="h-4 w-4 mr-2" />
            Só ida
          </ToggleGroupItem>
          
          <ToggleGroupItem 
            value="roundtrip" 
            className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${
              value === 'roundtrip' 
                ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-[#002366] font-medium shadow-md'
                : 'text-white/90 hover:bg-white/10'
            }`}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Ida e volta
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </TransitionEffect>
  );
};

export default TripTypeTabs;
