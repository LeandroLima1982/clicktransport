import React from 'react';
import { Car, Calendar, MapPin, Shield } from 'lucide-react';
const features = [{
  title: 'Frota Premium',
  description: 'Acesso a uma ampla variedade de veículos de luxo e especializados para qualquer tipo de transfer.',
  icon: Car
}, {
  title: 'Rastreamento em Tempo Real',
  description: "Acompanhe a localização do seu motorista e atualizações de status em tempo real para sua tranquilidade.",
  icon: MapPin
}, {
  title: 'Agendamento Fácil',
  description: 'Reserve com antecedência ou sob demanda com nosso sistema intuitivo de agendamento.',
  icon: Calendar
}, {
  title: 'Pagamentos Seguros',
  description: 'Processamento de pagamento seguro e transparente para todas as suas necessidades de transporte.',
  icon: Shield
}];
const Features: React.FC = () => {
  return <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Experimente Serviços de Transfer Premium</h2>
          <p className="text-lg text-foreground/70">A LaTranfer conecta você com fornecedores de transporte verificados para experiências de transfer corporativo e turístico sem complicações.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => <div key={index} className="p-8 rounded-2xl smooth-shadow hover:translate-y-[-5px] transition-all duration-300 bg-white">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-6">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-foreground/70">{feature.description}</p>
            </div>)}
        </div>
      </div>
    </section>;
};
export default Features;