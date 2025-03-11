
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import BookingForm from './BookingForm';
import { useIsMobile } from '@/hooks/use-mobile';

const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center w-full bg-gray-50">
      <div className="absolute inset-0 bg-[#F8D748] -z-10" />
      
      <div className="w-full py-4 my-8 md:my-12 lg:my-16">
        <div className="max-w-3xl mx-auto text-center mb-8 px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-fade-in text-black">
            <span className="block mb-2 text-zinc-700">Transporte executivo</span>
            <span className="block text-amber-500">para empresas e seus colaboradores</span>
          </h1>
          
          <p 
            style={{animationDelay: '0.2s'}} 
            className="text-base md:text-lg mb-8 animate-fade-in text-gray-700 max-w-2xl mx-auto"
          >
            São mais de 20 anos de experiência oferecendo serviços
            de locação de vans, ônibus e microônibus com motorista,
            proporcionando segurança e conforto para sua viagem.
          </p>
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="rounded-xl p-4 md:p-6 lg:p-8 shadow-xl bg-white animate-scale-in">
            <BookingForm />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-white -z-5"></div>
    </section>
  );
};

export default Hero;
