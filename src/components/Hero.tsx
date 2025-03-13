
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
      
      <div className="w-full bg-zinc-50 pt-16 pb-32 md:pt-24 md:pb-36 px-4 sm:px-6 relative rounded-b-[40px] md:rounded-b-[80px]">
        <div className="container mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            <span className="block mb-2 text-gray-800">Transporte Executivo</span>
            <span className="block text-amber-400 mt-2">para seus colaboradores</span>
          </h1>
          
          <p className="text-base md:text-lg mb-8 animate-fade-in opacity-90 text-gray-600 max-w-2xl mx-auto" style={{animationDelay: '0.2s'}}>
            Conectamos motoristas executivos a empresas offshore, agências de turismo e hoteis com eficiência e segurança.
          </p>
          
          <div className="flex justify-center space-x-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <a href="#request-service">
              <Button size="lg" className="rounded-full bg-[#F8D748] text-black hover:bg-[#F8D748]/90 font-medium px-6">
                Solicitar Transfer <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
        
        {/* Form Container - Elevated above the fold */}
        <div className="container mx-auto relative -mb-24">
          <div className="rounded-xl p-4 md:p-6 lg:p-8 shadow-xl bg-white animate-scale-in">
            <BookingForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
