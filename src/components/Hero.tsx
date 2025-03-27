
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  const [backgroundImage, setBackgroundImage] = useState<string>('/lovable-uploads/hero-bg.jpg');
  
  useEffect(() => {
    // Fetch the hero background image from Supabase
    const fetchHeroImage = async () => {
      try {
        const { data, error } = await supabase
          .from('site_images')
          .select('image_url')
          .eq('section_id', 'hero')
          .single();
        
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
    <section className="relative overflow-hidden min-h-[500px] flex items-center">
      <div className="container mx-auto relative z-10 py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-extrabold mb-4 md:mb-6 tracking-tighter text-white">
            Sua Plataforma de Transporte Executivo
          </h1>
          <p className="text-sm md:text-base mb-6 md:mb-8 text-white/90 font-light">
            Conectamos você a motoristas executivos que atendam suas necessidades de transporte com qualidade e pontualidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size={isMobile ? "default" : "lg"} 
              className="gap-2 text-base font-medium bg-primary hover:bg-primary/90" 
              onClick={scrollToBookingForm}
            >
              Reserve Agora
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size={isMobile ? "default" : "lg"} 
              className="text-base font-medium bg-white/10 text-white border-white/20 hover:bg-white/20" 
              onClick={scrollToSolutionsSection}
            >
              Nossos Serviços
            </Button>
          </div>
        </div>
      </div>
      
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 -z-10 bg-cover bg-center" 
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

      </div>
    </section>
  );
};

export default Hero;
