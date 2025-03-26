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
  return <section className="w-full py-[8px] mx-[2px] my-[20px] bg-white">
      <div className="max-w-[1400px] mx-auto px-4 w-full bg-white md:px-0 py-[4px]">
        

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {transportTypes.map((type, index) => <div key={index} className="card-service border border-[#D4AF37] shadow-[0_2px_8px_rgba(0,35,102,0.1)]">
              <div className="relative">
                <img src={type.image} alt={type.title} className="card-service-image" onError={e => {
              // Fallback para imagem padrão em caso de erro
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }} />
                <div className="absolute bottom-0 right-0 bg-[#002366] p-2 text-xs font-bold">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="card-service-content">
                <h3 className="font-bold mb-2 text-[#002366]">{type.title}</h3>
                <p className="text-sm text-[#2A2A2A] mb-3">{type.description}</p>
                <p className="text-xs font-medium text-[#2A2A2A]">{type.duration}</p>
              </div>
            </div>)}
        </div>

        <div className="text-center mt-10">
          <a href="#request-service">
            
          </a>
        </div>
      </div>
    </section>;
};
export default TransportTypes;