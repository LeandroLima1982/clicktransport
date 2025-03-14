
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import BookingForm from './BookingForm';
import { useIsMobile } from '@/hooks/use-mobile';

const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <section className="relative overflow-hidden w-screen bg-slate-50">
      {/* Yellow background that extends full width */}
      <div className="absolute inset-0 bg-[#F8D748] -z-10 w-full" />
      
      <div className="w-full pt-10 pb-16 md:pt-20 md:pb-32 relative rounded-b-[40px] md:rounded-b-[80px] bg-white">
        <div className="w-full text-center mb-8 md:mb-12 px-4 md:px-6 py-[50px] max-w-[1400px] mx-auto">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 animate-fade-in">
            <span className="block mb-2 text-gray-800 font-extrabold">Motoristas Executivos</span>
            <span className="block text-amber-400 mt-1 md:mt-2">a um Click de Distância</span>
          </h1>
          
          <p className="text-sm md:text-lg mb-6 md:mb-8 animate-fade-in opacity-90 text-gray-600 max-w-2xl mx-auto" style={{
          animationDelay: '0.2s'
        }}>Conectamos motoristas executivos a empresas offshore, agências de turismo, hotéis e pousadas. Sempre com pontualida,eficiência e segurança.</p>
          
          <div className="flex justify-center animate-fade-in" style={{
          animationDelay: '0.3s'
        }}>
            <a href="#request-service" className="w-full max-w-xs md:max-w-none md:w-auto">
            </a>
          </div>
        </div>
        
        {/* Booking Form - Improved positioning */}
        <div className="relative -mb-28 md:-mb-32 max-w-[900px] mx-auto px-4">
          <div className="shadow-xl bg-white rounded-xl animate-scale-in">
            <BookingForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
