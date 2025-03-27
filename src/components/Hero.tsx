
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
  return <section className="relative min-h-[85vh] md:min-h-[75vh] w-full flex items-center justify-center overflow-hidden mx-0">
      {/* Background image */}
      <div className="absolute inset-0 -z-10 bg-cover bg-center" style={{
      backgroundImage: `url(${backgroundImage})`
    }}>
        {/* Gradient overlay with dynamic colors */}
        <div className={`absolute inset-0 ${gradientStyle}`}></div>
      </div>
      
      {/* Content container */}
      <div className="container md:px-6 z-10 md:my-16 my-4 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className={`text-3xl md:text-5xl lg:text-6xl font-extrabold mb-6 md:mb-8 tracking-tight text-${styles.title_color} drop-shadow-md leading-tight`}>Transporte Executivo Premium</h1>
          
          <p className={`text-base md:text-xl mb-8 md:mb-10 text-${styles.description_color} drop-shadow max-w-2xl mx-auto leading-relaxed`}>
            Conectamos você a motoristas profissionais e veículos de alto padrão, garantindo deslocamentos eficientes, seguros e personalizados para negócios, turismo ou eventos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size={isMobile ? "lg" : "lg"} className="gap-2 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg transition-all duration-300 px-8 py-6 h-auto rounded-md" onClick={scrollToBookingForm}>
              Reserve Agora
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            <Button variant="outline" size={isMobile ? "lg" : "lg"} onClick={scrollToSolutionsSection} className="text-base font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md border-0 transition-all duration-300 px-8 py-6 h-auto rounded-md">SAIBA MAIS</Button>
          </div>
          
          {/* Scroll indicator */}
          <div className="hidden md:flex justify-center mt-20 animate-bounce">
            <ChevronDown onClick={scrollToSolutionsSection} className="rounded-full p-1 bg-yellow-500/80 w-10 h-10 cursor-pointer hover:bg-yellow-400 transition-colors duration-300" />
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;
