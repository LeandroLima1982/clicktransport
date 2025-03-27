
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  const [backgroundImage, setBackgroundImage] = useState<string>('/lovable-uploads/hero-bg.jpg');
  
  useEffect(() => {
    // Fetch the hero background image from Supabase
    const fetchHeroImage = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('site_images').select('image_url').eq('section_id', 'hero').single();
        if (error) {
          console.error('Error fetching hero image:', error);
          return;
        }
        if (data && data.image_url) {
          setBackgroundImage(data.image_url);
        }
      } catch (error) {
        console.error('Error processing hero image:', error);
      }
    };
    fetchHeroImage();
  }, []);

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

  return (
    <section className="relative min-h-[90vh] md:min-h-[80vh] w-full flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 -z-10 bg-cover bg-center" 
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Gradient overlay instead of dark mask */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent"></div>
      </div>
      
      {/* Content container */}
      <div className="container px-4 md:px-6 z-10 my-8 md:my-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-6 tracking-tight text-white drop-shadow-md">
            Sua Plataforma de Transporte Executivo
          </h1>
          
          <p className="text-base md:text-lg mb-6 md:mb-8 text-white/90 drop-shadow max-w-2xl mx-auto">
            Conectamos você a motoristas executivos que atendam suas necessidades de transporte com qualidade e pontualidade.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size={isMobile ? "default" : "lg"} 
              className="gap-2 text-base font-medium bg-primary hover:bg-primary/90 shadow-lg transition-all duration-300"
              onClick={scrollToBookingForm}
            >
              Reserve Agora
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size={isMobile ? "default" : "lg"} 
              onClick={scrollToSolutionsSection} 
              className="text-base font-medium bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md border-0 transition-all duration-300"
            >
              Nossos Serviços
            </Button>
          </div>
          
          {/* Scroll indicator */}
          <div className="hidden md:flex justify-center mt-16 animate-bounce">
            <ChevronDown 
              className="h-8 w-8 text-white/80 cursor-pointer hover:text-white transition-colors"
              onClick={scrollToSolutionsSection}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
