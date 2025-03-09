
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center">
      <div className="absolute inset-0 bg-secondary -z-10" />
      <div 
        className="absolute inset-0 bg-[url('/lovable-uploads/b5b67772-4b5a-4385-967c-915eddbf135b.png')] bg-center bg-no-repeat bg-cover opacity-20 -z-10" 
        style={{ backgroundPosition: 'center 33%' }}
      />
      
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="block mb-2">Transfer para Offshore e</span>
            <span className="text-primary">motoristas executivos</span>
          </h1>
          
          <p className="text-lg md:text-xl mb-8 text-gray-300">
            Transfer para colaboradores offshore com conforto, rapidez e pontualidade
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a href="#request-service">
              <Button size="lg" className="rounded-md w-full sm:w-auto px-8 py-6 text-base font-bold">
                Solicitar Transfer <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
