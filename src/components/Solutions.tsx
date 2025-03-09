
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const solutions = [
  {
    title: 'Rapidez & qualidade',
    description: 'Motoristas prontos para atender com veículos confortáveis e seguros'
  },
  {
    title: 'Profissionais treinados',
    description: 'Motoristas experientes com excelente conhecimento das rotas'
  },
  {
    title: 'Transfer personalizado',
    description: 'Opções de veículos e horários flexíveis para sua necessidade'
  },
  {
    title: 'Segurança garantida',
    description: 'Monitoramento em tempo real e protocolos de segurança rigorosos'
  }
];

const Solutions: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-semibold text-primary mb-2">NOSSOS SERVIÇOS</span>
          <h2 className="section-title mb-6">Soluções Inteligentes em Transporte Executivo</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Oferecemos soluções completas para transporte corporativo, offshore e executivo, 
            com atendimento personalizado e qualidade superior.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {solutions.map((solution, index) => (
            <div 
              key={index} 
              className="p-6 rounded-lg text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary text-xl">✓</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{solution.title}</h3>
              <p className="text-foreground/70">{solution.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a href="#request-service">
            <Button variant="outline" className="rounded-md border-primary text-secondary hover:bg-primary hover:text-secondary">
              Saiba Mais
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Solutions;
