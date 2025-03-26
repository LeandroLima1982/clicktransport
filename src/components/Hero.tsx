
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
    <section className="relative overflow-hidden md:py-[19px] py-[5px]">
      <div className="container mx-auto md:px-6 relative z-10 py-[25px] px-[38px]">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="tracking-tighter mb-6 mx-0 px-0 text-xl font-extrabold md:text-4xl">Sua Plataforma de Transporte Executivo</h1>
          <p className="text-gray-600 mb-8 text-sm my-0 px-0 py-0 font-extralight md:text-base mx-0">Conectamos você a motoristas executivos
 que atendam suas necessidades de transporte com qualidade e pontualidade.</p>
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
      
      {/* Background image */}
      <div 
        className="absolute inset-0 -z-10 bg-cover bg-center" 
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
    </section>
  );
};

export default Hero;
