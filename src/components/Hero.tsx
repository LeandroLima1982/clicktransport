
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  return <section className="relative overflow-hidden w-full bg-slate-50">
      {/* Yellow background that extends full width */}
      <div className="absolute inset-0 bg-[#F8D748] -z-10 w-full" />
      
      <div className="w-full pt-10 pb-16 md:pt-20 md:pb-32 relative rounded-b-[40px] md:rounded-b-[80px] bg-white py-0">
        <div className="w-full text-center mb-8 md:mb-12 max-w-[1400px] mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 animate-fade-in">
            
            
          </h1>
          
          
          
          <div className="flex justify-center animate-fade-in" style={{
          animationDelay: '0.3s'
        }}>
            <a href="#request-service" className="w-full max-w-xs md:max-w-none md:w-auto">
            </a>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;
