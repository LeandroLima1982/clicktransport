import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, User, Building2, Users, Plane, CarFront, Clock } from 'lucide-react';
const solutions = [{
  icon: <User className="h-10 w-10 text-primary" />,
  title: 'Transfer Executivo',
  description: 'Serviço premium com carros executivos e motoristas altamente treinados para levar executivos e clientes VIP com o máximo conforto e pontualdiade.',
  features: ['Motoristas bilíngues', 'Carros luxuosos', 'Acompanhamento em tempo real']
}, {
  icon: <Building2 className="h-10 w-10 text-primary" />,
  title: 'Transfer Corporativo',
  description: 'Soluções completas de transfer para empresas que precisam transportar colaboradores com segurança e confiabilidade, otimizando tempo e recursos.',
  features: ['Gestão centralizada', 'Faturamento corporativo', 'Relatórios detalhados']
}, {
  icon: <Users className="h-10 w-10 text-primary" />,
  title: 'Transfer para Grupos',
  description: 'Transporte de grupos para eventos corporativos, congressos e feiras, com vans e ônibus modernos e confortáveis, garantindo a melhor experiência.',
  features: ['Vans e ônibus modernos', 'Coordenação de logística', 'Acompanhamento especializado']
}, {
  icon: <Plane className="h-10 w-10 text-primary" />,
  title: 'Transfer Aeroporto',
  description: 'Recepção e transporte de passageiros do aeroporto para o hotel ou destino desejado, com monitoramento de voos e flexibilidade para atrasos.',
  features: ['Monitoramento de voos', 'Recepção personalizada', 'Assistência com bagagens']
}, {
  icon: <CarFront className="h-10 w-10 text-primary" />,
  title: 'Transfer Offshore',
  description: 'Transporte especializado para colaboradores da indústria de óleo e gás, com veículos adequados e motoristas treinados para as necessidades específicas.',
  features: ['Veículos adequados', 'Motoristas certificados', 'Disponibilidade 24h']
}, {
  icon: <Clock className="h-10 w-10 text-primary" />,
  title: 'Transfer Turístico',
  description: 'Conheça os melhores pontos turísticos com conforto e segurança, com motoristas que conhecem as melhores rotas e pontos turísticos.',
  features: ['Roteiros personalizados', 'Guias especializados', 'Experiência local']
}];
const SolutionCard = ({
  solution,
  index
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const scrollToBookingForm = () => {
    document.getElementById('request-service')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };
  return <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative stagger-item" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onTouchStart={() => setIsHovered(true)}>
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardHeader>
        <div className="mb-4">{solution.icon}</div>
        <CardTitle className="text-xl">{solution.title}</CardTitle>
        <CardDescription className="text-foreground/70">{solution.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {solution.features.map((feature, idx) => <li key={idx} className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
              <span>{feature}</span>
            </li>)}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col">
        {isHovered && <Button variant="default" className="w-full bg-primary text-white transition-all duration-300 animate-pulse mt-2" onClick={scrollToBookingForm}>
            <span className="flex items-center">
              Solicitar <ArrowRight className="ml-2 h-4 w-4 animate-slide-right" />
            </span>
          </Button>}
      </CardFooter>
    </Card>;
};
const Solutions: React.FC = () => {
  return;
};
export default Solutions;