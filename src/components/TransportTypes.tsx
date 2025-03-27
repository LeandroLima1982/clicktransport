import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

// Definir tipo para os dados de transporte
interface TransportType {
  id: string;
  image: string;
  title: string;
  description: string;
  duration: string;
}

// Dados iniciais (fallback) caso não consiga buscar do banco
const defaultTransportTypes: TransportType[] = [{
  id: 'offshore',
  image: '/lovable-uploads/hero-bg.jpg',
  title: 'Transfer para Offshore',
  description: 'Transporte para colaboradores com pontualidade e conforto',
  duration: 'A partir de 2h30min • R$350,00'
}, {
  id: 'airport',
  image: '/lovable-uploads/hero-bg.jpg',
  title: 'Transfer para Aeroportos',
  description: 'Chegue com tranquilidade para seu voo ou retorno',
  duration: 'A partir de 1h30min • R$220,00'
}, {
  id: 'vip',
  image: '/lovable-uploads/hero-bg.jpg',
  title: 'Transfer VIP & Executivo',
  description: 'Conforto e elegância para executivos e eventos especiais',
  duration: 'A partir de 3h • R$450,00'
}, {
  id: 'events',
  image: '/lovable-uploads/hero-bg.jpg',
  title: 'Transfer para Eventos',
  description: 'Soluções para transporte de grupos em eventos corporativos',
  duration: 'A partir de 4h • R$600,00'
}];
const TransportTypes: React.FC = () => {
  const [transportTypes, setTransportTypes] = useState<TransportType[]>(defaultTransportTypes);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Function to control autoplay
  const startAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
    }
    autoplayTimerRef.current = setInterval(() => {
      if (!isPaused && carouselRef.current) {
        setActiveIndex(prev => (prev + 1) % transportTypes.length);
        const nextButton = carouselRef.current.querySelector('[data-carousel-next]') as HTMLButtonElement;
        if (nextButton) {
          nextButton.click();
        }
      }
    }, 5000); // Scroll every 5 seconds (slightly longer for better UX)
  }, [isPaused, transportTypes.length]);

  // Function to check if the section is in viewport
  const checkIfInViewport = useCallback(() => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const isInViewport = rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);

    // Only pause if not in viewport
    if (!isInViewport && !isPaused) {
      setIsPaused(true);
    } else if (isInViewport && isPaused) {
      setIsPaused(false);
    }
  }, [isPaused]);

  // Pause autoplay on interaction
  const pauseAutoplay = () => {
    setIsPaused(true);
  };

  // Resume autoplay after interaction
  const resumeAutoplay = () => {
    setIsPaused(false);
  };
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        // Buscar todas as imagens da tabela site_images
        const {
          data,
          error
        } = await supabase.from('site_images').select('*');
        if (error) {
          console.error('Erro ao buscar imagens:', error);
          return;
        }
        if (data && data.length > 0) {
          // Criar uma cópia do array de transportes
          const updatedTransportTypes = [...defaultTransportTypes];

          // Atualizar as imagens com base nos dados do banco
          data.forEach(item => {
            const transportIndex = updatedTransportTypes.findIndex(transport => transport.id === item.section_id);
            if (transportIndex !== -1 && item.image_url) {
              updatedTransportTypes[transportIndex].image = item.image_url;
            }
          });
          setTransportTypes(updatedTransportTypes);
        }
      } catch (error) {
        console.error('Erro ao processar imagens:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();

    // Start autoplay when component mounts
    startAutoplay();

    // Add scroll event listener to check if section is in viewport
    window.addEventListener('scroll', checkIfInViewport);
    checkIfInViewport(); // Check on initial load

    // Cleanup interval and event listener on component unmount
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
      window.removeEventListener('scroll', checkIfInViewport);
    };
  }, [startAutoplay, checkIfInViewport]);
  const scrollToBookingForm = () => {
    document.getElementById('request-service')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };
  return <section className="w-full py-16 bg-white" ref={sectionRef}>
      <div className="max-w-[1400px] mx-auto px-4 w-full md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Diversas Opções de Transporte</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Escolha entre nossas diversas opções de transporte para atender sua necessidade
          </p>
        </div>
        
        <Carousel opts={{
        align: "start",
        loop: true
      }} className="w-full" ref={carouselRef} onMouseEnter={pauseAutoplay} onMouseLeave={resumeAutoplay} onTouchStart={pauseAutoplay} onTouchEnd={resumeAutoplay}>
          <CarouselContent className="-ml-2 md:-ml-4">
            {transportTypes.map((type, index) => <CarouselItem key={index} className="pl-2 md:pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <div className={`relative h-full overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-500 transform ${activeIndex === index ? 'scale-105 shadow-xl -translate-y-2' : 'scale-100'}`} onMouseEnter={() => {
              pauseAutoplay();
              setHoveredItem(index);
              setActiveIndex(index);
            }} onMouseLeave={() => {
              resumeAutoplay();
              setHoveredItem(null);
            }} onTouchStart={() => {
              pauseAutoplay();
              setHoveredItem(index);
              setActiveIndex(index);
            }} onTouchEnd={() => {
              // Don't resume on touchEnd to allow interaction on mobile
            }}>
                  <div className="relative">
                    <img src={type.image} alt={type.title} className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105" onError={e => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }} />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/50" />
                    <div className="absolute bottom-4 right-4 bg-primary p-2 rounded-full shadow-lg">
                      <ArrowRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{type.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500 whitespace-nowrap mb-2">{type.duration}</span>
                      {(hoveredItem === index || activeIndex === index) && <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-full px-4 py-2 text-sm animate-pulse w-full" onClick={scrollToBookingForm}>
                          Solicitar
                        </Button>}
                    </div>
                  </div>
                </div>
              </CarouselItem>)}
          </CarouselContent>
          
          <div>
            <CarouselPrevious className="absolute -left-12 top-1/2 hidden md:flex" data-carousel-prev />
            <CarouselNext className="absolute -right-12 top-1/2 hidden md:flex" data-carousel-next />
          </div>
        </Carousel>
        
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {transportTypes.map((_, index) => <button key={index} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === activeIndex ? 'bg-primary w-6' : 'bg-gray-300'}`} onClick={() => {
            setActiveIndex(index);
            pauseAutoplay();

            // Move carousel to this item
            if (carouselRef.current) {
              // Find the item and scroll to it
              const items = carouselRef.current.querySelectorAll('[data-radix-carousel-element="item"]');
              if (items && items[index]) {
                (items[index] as HTMLElement).scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                  inline: 'center'
                });
              }
            }

            // Resume auto-scroll after a delay
            setTimeout(() => resumeAutoplay(), 6000);
          }} />)}
          </div>
        </div>
      </div>
    </section>;
};
export default TransportTypes;