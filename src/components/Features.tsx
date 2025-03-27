
import React, { useEffect, useRef } from 'react';
import { Car, Calendar, MapPin, Shield } from 'lucide-react';

const features = [
  {
    title: 'Frota Premium',
    description: 'Acesso a uma ampla variedade de veículos de luxo e especializados para qualquer tipo de transfer.',
    icon: Car
  },
  {
    title: 'Rastreamento em Tempo Real',
    description: "Acompanhe a localização do seu motorista e atualizações de status em tempo real para sua tranquilidade.",
    icon: MapPin
  },
  {
    title: 'Agendamento Fácil',
    description: 'Reserve com antecedência ou sob demanda com nosso sistema intuitivo de agendamento.',
    icon: Calendar
  },
  {
    title: 'Pagamentos Seguros',
    description: 'Processamento de pagamento seguro e transparente para todas as suas necessidades de transporte.',
    icon: Shield
  }
];

const Features: React.FC = () => {
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animation for features when they come into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add animation classes to child elements with delay
            const featureCards = entry.target.querySelectorAll('.feature-card');
            featureCards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('visible');
              }, index * 150); // Stagger the animations
            });
          }
        });
      },
      {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current);
      }
    };
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Experimente Serviços de Transfer Premium</h2>
          <p className="text-lg text-foreground/70">
            A LaTranfer conecta você com fornecedores de transporte verificados para experiências de transfer corporativo e turístico sem complicações.
          </p>
        </div>

        <div 
          ref={featuresRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card p-8 rounded-2xl smooth-shadow hover:translate-y-[-5px] transition-all duration-500 bg-white stagger-item"
              style={{ 
                transitionDelay: `${index * 100}ms`,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="transform transition-all duration-500 hover:scale-110">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                  <feature.icon className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-foreground/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
