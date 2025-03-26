import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  return <section className="relative overflow-hidden w-full bg-slate-50">
      {/* Yellow background that extends full width */}
      <div className="absolute inset-0 bg-[#F8D748] -z-10 w-full" />
      
      
    </section>;
};
export default Hero;