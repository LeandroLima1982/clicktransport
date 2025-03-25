import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

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
  return <section className="bg-gray-50 w-full py-[8px] mx-[2px] my-[51px]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 w-full">
        <div className="text-center mb-12">
          <h2 className="section-title mb-6 my-0">Soluções em Transporte Sob Demanda </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto my-[23px]">Oferecemos uma variedade de opções de transporte
 para atender suas necessidades com qualidade e segurança garantidas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {transportTypes.map((type, index) => <div key={index} className="card-service">
              <div className="relative">
                <img src={type.image} alt={type.title} className="card-service-image" onError={e => {
              // Fallback para imagem padrão em caso de erro
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }} />
                <div className="absolute bottom-0 right-0 bg-primary p-2 text-xs font-bold">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
              <div className="card-service-content">
                <h3 className="font-bold mb-2">{type.title}</h3>
                <p className="text-sm text-foreground/70 mb-3">{type.description}</p>
                <p className="text-xs font-medium">{type.duration}</p>
              </div>
            </div>)}
        </div>

        <div className="text-center mt-10">
          <a href="#request-service">
            <Button className="rounded-md">
              Ver Todos os Serviços
            </Button>
          </a>
        </div>
      </div>
    </section>;
};
export default TransportTypes;