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
  const scrollToSolutionsSection = () => {
    document.getElementById('solutions-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };
  return <section className="relative overflow-hidden md:py-[19px] py-[5px]">
      <div className="container mx-auto md:px-6 relative z-10 px-0 py-[25px]">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-bold tracking-tighter mb-6 text-2xl mx-0 px-0 md:text-4xl">Sua Plataforma de Transporte Executivo</h1>
          <p className="text-gray-600 mb-8 font-extralight text-xs py-0 px-0 md:text-2xl">Conectamos você a motoristas executivos que atendam suas necessidades de transporte com qualidade e pontualidade.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2 text-base font-medium" onClick={scrollToBookingForm}>
              Reserve Agora
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-base font-medium" onClick={scrollToSolutionsSection}>
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