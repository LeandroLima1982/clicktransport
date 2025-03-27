
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, User, Building2, Users, Plane, CarFront, Clock } from 'lucide-react';

const solutions = [
  {
    icon: <User className="h-10 w-10 text-primary" />,
    title: 'Transfer Executivo',
    description: 'Serviço premium com carros executivos e motoristas altamente treinados para levar executivos e clientes VIP com o máximo conforto e pontualdiade.',
    features: ['Motoristas bilíngues', 'Carros luxuosos', 'Acompanhamento em tempo real']
  },
  {
    icon: <Building2 className="h-10 w-10 text-primary" />,
    title: 'Transfer Corporativo',
    description: 'Soluções completas de transfer para empresas que precisam transportar colaboradores com segurança e confiabilidade, otimizando tempo e recursos.',
    features: ['Gestão centralizada', 'Faturamento corporativo', 'Relatórios detalhados']
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'Transfer para Grupos',
    description: 'Transporte de grupos para eventos corporativos, congressos e feiras, com vans e ônibus modernos e confortáveis, garantindo a melhor experiência.',
    features: ['Vans e ônibus modernos', 'Coordenação de logística', 'Acompanhamento especializado']
  },
  {
    icon: <Plane className="h-10 w-10 text-primary" />,
    title: 'Transfer Aeroporto',
    description: 'Recepção e transporte de passageiros do aeroporto para o hotel ou destino desejado, com monitoramento de voos e flexibilidade para atrasos.',
    features: ['Monitoramento de voos', 'Recepção personalizada', 'Assistência com bagagens']
  },
  {
    icon: <CarFront className="h-10 w-10 text-primary" />,
    title: 'Transfer Offshore',
    description: 'Transporte especializado para colaboradores da indústria de óleo e gás, com veículos adequados e motoristas treinados para as necessidades específicas.',
    features: ['Veículos adequados', 'Motoristas certificados', 'Disponibilidade 24h']
  },
  {
    icon: <Clock className="h-10 w-10 text-primary" />,
    title: 'Transfer Turístico',
    description: 'Conheça os melhores pontos turísticos com conforto e segurança, com motoristas que conhecem as melhores rotas e pontos turísticos.',
    features: ['Roteiros personalizados', 'Guias especializados', 'Experiência local']
  }
];

const SolutionCard = ({ solution, index, isPaused, visibleIndex }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  
  const scrollToBookingForm = () => {
    document.getElementById('request-service')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const isActive = visibleIndex === index;
  
  return (
    <Card 
      key={index} 
      ref={cardRef}
      className={`border-none shadow-lg transition-all duration-500 overflow-hidden group relative stagger-item ${isActive ? 'scale-105 shadow-xl' : 'scale-100'}`}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      onTouchStart={() => setIsHovered(true)}
    >
      <div className={`absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent transition-opacity duration-300 ${isActive || isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
      <CardHeader>
        <div className="mb-4 transform transition-transform duration-300 group-hover:scale-110">{solution.icon}</div>
        <CardTitle className="text-xl">{solution.title}</CardTitle>
        <CardDescription className="text-foreground/70">{solution.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {solution.features.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col">
        {(isHovered || isActive) && (
          <Button 
            variant="default" 
            className="w-full bg-primary text-white transition-all duration-300 animate-pulse mt-2" 
            onClick={scrollToBookingForm}
          >
            <span className="flex items-center">
              Solicitar <ArrowRight className="ml-2 h-4 w-4 animate-slide-right" />
            </span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const Solutions: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const containerRef = useRef(null);
  const autoScrollTimerRef = useRef(null);
  
  useEffect(() => {
    // Set up the animation interval
    const startAutoScroll = () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
      
      autoScrollTimerRef.current = setInterval(() => {
        if (!isPaused) {
          setVisibleIndex((prev) => (prev + 1) % solutions.length);
        }
      }, 4000); // Change card every 4 seconds
    };
    
    startAutoScroll();
    
    // Clean up interval on unmount
    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [isPaused]);

  useEffect(() => {
    // Intersection Observer to detect when the section comes into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Pause animation when section is not in view
        setIsPaused(!entry.isIntersecting);
      });
    }, {
      root: null,
      threshold: 0.1, // Trigger when 10% of the element is visible
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <section 
      id="solutions-section" 
      ref={containerRef}
      className="py-24 px-4 bg-white scroll-mt-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossas Soluções de Transfer</h2>
          <p className="text-lg text-foreground/70">
            Oferecemos uma variedade de serviços de transfer personalizados para atender às suas necessidades específicas
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <SolutionCard 
              key={index}
              solution={solution} 
              index={index} 
              isPaused={isPaused}
              visibleIndex={visibleIndex}
            />
          ))}
        </div>
        
        <div className="flex justify-center mt-12">
          <div className="flex space-x-2">
            {solutions.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === visibleIndex ? 'bg-primary w-6' : 'bg-gray-300'
                }`}
                onClick={() => {
                  setVisibleIndex(index);
                  setIsPaused(true);
                  // Resume auto-scroll after a delay
                  setTimeout(() => setIsPaused(false), 6000);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solutions;
