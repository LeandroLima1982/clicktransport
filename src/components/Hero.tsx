import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import BookingForm from './BookingForm';
const Hero: React.FC = () => {
  return <section className="relative min-h-screen flex items-center">
      <div className="absolute inset-0 bg-secondary -z-10" />
      <div className="absolute inset-0 bg-[url('/lovable-uploads/f60df9db-ef10-4c22-a8e1-d6b0299c9342.png')] bg-center bg-no-repeat bg-cover opacity-20 -z-10" style={{
      backgroundPosition: 'center 33%'
    }} />
      
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto text-center text-white mb-12">
          <span className="inline-block text-primary font-bold px-4 py-1 rounded-full bg-primary/10 mb-4 animate-fade-in">
            TRASLADOS EXECUTIVOS | TRANSFER OFFSHORE
          </span>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-in">
            <span className="block mb-2">Transfer para empresas e</span>
            <span className="text-primary">motoristas executivos</span>
          </h1>
          
          <p className="text-lg md:text-xl mb-8 text-gray-300 animate-fade-in" style={{
          animationDelay: '0.2s'
        }}>
            Transfer para colaboradores offshore com conforto, rapidez e pontualidade
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="glass-morphism rounded-xl p-6 md:p-8 shadow-lg bg-white/10 backdrop-blur-md border border-white/20 transform transition-all duration-500 hover:shadow-xl">
            <BookingForm />
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;