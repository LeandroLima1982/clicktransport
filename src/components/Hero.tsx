
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import BookingForm from './BookingForm';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center w-full">
      <div className="absolute inset-0 bg-[#F8D748] -z-10" />
      
      <div className="w-full py-[50px] md:py-[100px]">
        <div className="max-w-3xl mx-auto text-center mb-8 px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-fade-in text-black">
            <span className="block mb-2">Aluguel de Van, Ônibus e</span>
            <span className="block">Micro-ônibus</span>
          </h1>
          
          <p className="text-base md:text-lg mb-8 text-gray-800 animate-fade-in" style={{
            animationDelay: '0.2s'
          }}>
            São mais de 20 anos de experiência oferecendo serviços
            de locação de vans, ônibus e microônibus com motorista,
            proporcionando segurança e conforto para sua viagem.
          </p>
        </div>
        
        <div className="w-full px-4 sm:max-w-4xl sm:mx-auto">
          <div className="rounded-xl p-6 md:p-8 shadow-lg bg-white animate-scale-in">
            <BookingForm />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[80px] bg-[#1F1F1F] -z-5"></div>
    </section>
  );
};

export default Hero;
