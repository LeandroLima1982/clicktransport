import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  return <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">Sua plataforma
 de Transfer Executivo </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">Viagens seguras e confortáveis para aeroportos, eventos e muito mais</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2 text-base font-medium" onClick={() => document.getElementById('booking-form')?.scrollIntoView({
            behavior: 'smooth'
          })}>
              Reserve Agora
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-base font-medium">
              Nossos Serviços
            </Button>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white to-gray-50"></div>
    </section>;
};
export default Hero;