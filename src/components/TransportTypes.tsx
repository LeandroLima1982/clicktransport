import React, { useState, useEffect } from 'react';
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
  duration: 'A partir de 2h30min • R$ 350,00'
}, {
  id: 'airport',
  image: '/lovable-uploads/hero-bg.jpg',
  title: 'Transfer para Aeroportos',
  description: 'Chegue com tranquilidade para seu voo ou retorno',
  duration: 'A partir de 1h30min • R$ 220,00'
}, {
  id: 'vip',
  image: '/lovable-uploads/hero-bg.jpg',
  title: 'Transfer VIP & Executivo',
  description: 'Conforto e elegância para executivos e eventos especiais',
  duration: 'A partir de 3h • R$ 450,00'
}, {
  id: 'events',
  image: '/lovable-uploads/hero-bg.jpg',
  title: 'Transfer para Eventos',
  description: 'Soluções para transporte de grupos em eventos corporativos',
  duration: 'A partir de 4h • R$ 600,00'
}];
const TransportTypes: React.FC = () => {
  const [transportTypes, setTransportTypes] = useState<TransportType[]>(defaultTransportTypes);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
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
  }, []);
  const handleCardHover = (id: string) => {
    setHoveredCard(id);
  };
  const handleCardLeave = () => {
    setHoveredCard(null);
  };
  const scrollToBookingForm = () => {
    document.getElementById('request-service')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };
  return <section className="w-full py-[8px] mx-[2px] my-[20px] bg-white">
      <div className="max-w-[1400px] mx-auto px-4 w-full bg-white md:px-6 py-[4px]">
        <Carousel opts={{
        align: "start",
        loop: true
      }} className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {transportTypes.map((type, index) => <CarouselItem key={index} className="pl-2 md:pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 px-[12px] mx-[18px] my-[28px]">
                <div className="relative h-full overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl" onMouseEnter={() => handleCardHover(type.id)} onMouseLeave={handleCardLeave} onTouchStart={() => handleCardHover(type.id)}>
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">{type.duration}</span>
                      {hoveredCard === type.id && <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-full px-4 py-2 text-sm animate-fade-in" onClick={scrollToBookingForm}>
                          Agendar
                        </Button>}
                    </div>
                  </div>
                </div>
              </CarouselItem>)}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="absolute -left-12 top-1/2" />
            <CarouselNext className="absolute -right-12 top-1/2" />
          </div>
        </Carousel>
      </div>
    </section>;
};
export default TransportTypes;