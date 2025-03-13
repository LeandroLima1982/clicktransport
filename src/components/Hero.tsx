
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import BookingForm from './BookingForm';
import { useIsMobile } from '@/hooks/use-mobile';

const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <section className="relative overflow-hidden w-full">
      {/* Yellow background with wave shape */}
      <div className="absolute inset-0 bg-[#F8D748] -z-10" />
      
      <div className="w-full bg-zinc-50 pt-10 pb-28 md:pt-24 md:pb-36 px-2 sm:px-4 relative rounded-b-[40px] md:rounded-b-[80px]">
        <div className="container mx-auto text-center mb-8 md:mb-12 px-2">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 animate-fade-in">
            <span className="block mb-2 text-gray-800">Transporte Executivo</span>
            <span className="block text-amber-400 mt-1 md:mt-2">para seus colaboradores</span>
          </h1>
          
          <p className="text-sm md:text-lg mb-6 md:mb-8 animate-fade-in opacity-90 text-gray-600 max-w-2xl mx-auto" style={{animationDelay: '0.2s'}}>
            Conectamos motoristas executivos a empresas offshore, agências de turismo e hoteis com eficiência e segurança.
          </p>
          
          <div className="flex justify-center animate-fade-in" style={{animationDelay: '0.3s'}}>
            <a href="#request-service" className="w-full max-w-xs md:max-w-none md:w-auto">
              <Button size={isMobile ? "default" : "lg"} className="w-full md:w-auto rounded-full bg-[#F8D748] text-black hover:bg-[#F8D748]/90 font-medium px-4 md:px-6">
                Solicitar Transfer <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
        
        {/* Form Container - Elevated above the fold */}
        <div className="px-2 sm:px-4 md:container mx-auto relative -mb-24 md:-mb-28">
          <div className="rounded-xl p-3 md:p-6 lg:p-8 shadow-xl bg-white animate-scale-in">
            <BookingForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
