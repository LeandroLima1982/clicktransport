import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import BookingForm from './BookingForm';
const Hero: React.FC = () => {
  return <section className="relative min-h-[calc(100vh-80px)] flex items-center w-full mx-0 px-0 py-0 bg-gray-50">
      <div className="absolute inset-0 bg-[#F8D748] -z-10" />
      
      <div className="w-full py-[10px] md:py-0 mx-0 my-[60px] md:my-[80px]">
        <div className="max-w-3xl mx-auto text-center mb-8 px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-fade-in text-black">
            <span className="block mb-2 text-zinc-700 my-[28px] mx-[48px]">Transporte executivo</span>
            <span className="block text-amber-500">para empresas e seus colaboradores</span>
          </h1>
          
          <p style={{
          animationDelay: '0.2s'
        }} className="text-base md:text-lg mb-8 animate-fade-in text-gray-50">
            São mais de 20 anos de experiência oferecendo serviços
            de locação de vans, ônibus e microônibus com motorista,
            proporcionando segurança e conforto para sua viagem.
          </p>
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="rounded-xl p-6 md:p-8 shadow-xl bg-white animate-scale-in">
            <BookingForm />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-white -z-5"></div>
    </section>;
};
export default Hero;