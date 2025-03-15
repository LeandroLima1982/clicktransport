
import React from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'João Silva',
    role: 'Gerente de Operações',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    stars: 5,
    text: 'O serviço foi impecável! Motorista pontual e muito educado. Veículo confortável e limpo.'
  },
  {
    name: 'Mariana Costa',
    role: 'Analista Financeira',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    stars: 5,
    text: 'Contratei o serviço para ir ao aeroporto e foi excelente. Motorista chegou antes do horário.'
  },
  {
    name: 'Carlos Ribeiro',
    role: 'Engenheiro Offshore',
    photo: 'https://randomuser.me/api/portraits/men/67.jpg',
    stars: 5,
    text: 'Uso o serviço regularmente para ir à base e sempre funciona perfeitamente. Recomendo!'
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50 w-full">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 w-full">
        <div className="text-center mb-12">
          <h2 className="section-title mb-6">O Que Nossos Clientes Dizem</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Veja depoimentos de clientes que utilizam nossos serviços de transfer 
            e confiam na qualidade do nosso atendimento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.photo} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-foreground/60">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm">{testimonial.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" className="rounded-md border-primary text-secondary hover:bg-primary hover:text-secondary">
            Ver Mais Depoimentos
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
