
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

interface HeroStyles {
  gradient_from_color: string;
  gradient_from_opacity: number;
  gradient_to_color: string;
  gradient_to_opacity: number;
  title_color: string;
  description_color: string;
}

const defaultStyles: HeroStyles = {
  gradient_from_color: 'black',
  gradient_from_opacity: 40,
  gradient_to_color: 'transparent',
  gradient_to_opacity: 0,
  title_color: 'white',
  description_color: 'white/90'
};

const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  const [backgroundImage, setBackgroundImage] = useState<string>('/lovable-uploads/hero-bg.jpg');
  const [styles, setStyles] = useState<HeroStyles>(defaultStyles);
  
  useEffect(() => {
    // Fetch the hero background image and styles from Supabase
    const fetchHeroData = async () => {
      try {
        // Fetch image
        const {
          data: imageData,
          error: imageError
        } = await supabase.from('site_images').select('image_url').eq('section_id', 'hero').single();
        
        if (imageError) {
          console.error('Error fetching hero image:', imageError);
        } else if (imageData && imageData.image_url) {
          setBackgroundImage(imageData.image_url);
        }
        
        // Fetch styles
        const {
          data: stylesData,
          error: stylesError
        // Use proper typing for the from method by specifying the table name as a known table
        } = await supabase.from('hero_styles').select('*').single();
        
        if (stylesError) {
          console.error('Error fetching hero styles:', stylesError);
        } else if (stylesData) {
          setStyles({
            gradient_from_color: stylesData.gradient_from_color || defaultStyles.gradient_from_color,
            gradient_from_opacity: stylesData.gradient_from_opacity ?? defaultStyles.gradient_from_opacity,
            gradient_to_color: stylesData.gradient_to_color || defaultStyles.gradient_to_color,
            gradient_to_opacity: stylesData.gradient_to_opacity ?? defaultStyles.gradient_to_opacity,
            title_color: stylesData.title_color || defaultStyles.title_color,
            description_color: stylesData.description_color || defaultStyles.description_color
          });
        }
      } catch (error) {
        console.error('Error processing hero data:', error);
      }
    };
    
    fetchHeroData();
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
  
  // Build the gradient style dynamically
  const gradientStyle = `bg-gradient-to-b from-${styles.gradient_from_color}/${styles.gradient_from_opacity} to-${styles.gradient_to_color}/${styles.gradient_to_opacity}`;

  return (
    <section className="relative min-h-[90vh] md:min-h-[80vh] w-full flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 -z-10 bg-cover bg-center" 
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Gradient overlay with dynamic colors */}
        <div className={`absolute inset-0 ${gradientStyle}`}></div>
      </div>
      
      {/* Content container */}
      <div className="container px-4 md:px-6 z-10 my-8 md:my-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className={`text-3xl md:text-5xl font-extrabold mb-4 md:mb-6 tracking-tight text-${styles.title_color} drop-shadow-md`}>
            Sua Plataforma de Transporte Executivo
          </h1>
          
          <p className={`text-base md:text-lg mb-6 md:mb-8 text-${styles.description_color} drop-shadow max-w-2xl mx-auto`}>
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
              className={`h-8 w-8 text-${styles.title_color}/80 cursor-pointer hover:text-${styles.title_color} transition-colors`}
              onClick={scrollToSolutionsSection}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
