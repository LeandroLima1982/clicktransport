import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
const transportTypes = [{
  image: 'https://images.unsplash.com/photo-1581222963832-ca932c2317ad?ixlib=rb-4.0.3',
  title: 'Transfer para Offshore',
  description: 'Transporte para colaboradores com pontualidade e conforto',
  duration: 'A partir de 2h30min • R$ 350,00'
}, {
  image: 'https://images.unsplash.com/photo-1596394465101-64a9b9c3dc92?ixlib=rb-4.0.3',
  title: 'Transfer para Aeroportos',
  description: 'Chegue com tranquilidade para seu voo ou retorno',
  duration: 'A partir de 1h30min • R$ 220,00'
}, {
  image: 'https://images.unsplash.com/photo-1571214587716-4def4cc5ffd9?ixlib=rb-4.0.3',
  title: 'Transfer VIP & Executivo',
  description: 'Conforto e elegância para executivos e eventos especiais',
  duration: 'A partir de 3h • R$ 450,00'
}, {
  image: 'https://images.unsplash.com/photo-1581222436649-527d9a720281?ixlib=rb-4.0.3',
  title: 'Transfer para Eventos',
  description: 'Soluções para transporte de grupos em eventos corporativos',
  duration: 'A partir de 4h • R$ 600,00'
}];
const TransportTypes: React.FC = () => {
  return <section className="bg-gray-50 w-full py-[33px] my-[69px] mx-0">
      <div className="px-4 w-full">
        <div className="text-center mb-12">
          <h2 className="section-title mb-6">Soluções de Transporte Feitas para Você</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Oferecemos uma variedade de opções de transporte para atender suas necessidades específicas, 
            com qualidade e segurança garantidas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {transportTypes.map((type, index) => <div key={index} className="card-service">
              <div className="relative">
                <img src={type.image} alt={type.title} className="card-service-image" />
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