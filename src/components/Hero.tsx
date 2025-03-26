
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  
  const scrollToBookingForm = () => {
    document.getElementById('request-service')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  return <section className="relative overflow-hidden md:py-[19px] py-[5px]">
      <div className="container mx-auto md:px-6 relative z-10 px-0 py-[25px]">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-bold tracking-tighter mb-6 text-2xl md:text-5xl">Sua Plataforma
 de Transporte Executivo </h1>
          <p className="md:text-xl text-gray-600 mb-8 font-extralight text-xs">Oferecemos uma variedade de transportes executivos
 para atender suas necessidades com pontualidade e qualidade.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2 text-base font-medium" onClick={scrollToBookingForm}>
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
