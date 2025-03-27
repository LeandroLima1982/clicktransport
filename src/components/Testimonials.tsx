
import React from 'react';
import { Button } from '@/components/ui/button';
import { Star, Quote } from 'lucide-react';

const testimonials = [{
  name: 'João Silva',
  role: 'Gerente de Operações',
  photo: 'https://randomuser.me/api/portraits/men/32.jpg',
  stars: 5,
  text: 'O serviço foi impecável! Motorista pontual e muito educado. Veículo confortável e limpo.'
}, {
  name: 'Mariana Costa',
  role: 'Analista Financeira',
  photo: 'https://randomuser.me/api/portraits/women/44.jpg',
  stars: 5,
  text: 'Contratei o serviço para ir ao aeroporto e foi excelente. Motorista chegou antes do horário.'
}, {
  name: 'Carlos Ribeiro',
  role: 'Engenheiro Offshore',
  photo: 'https://randomuser.me/api/portraits/men/67.jpg',
  stars: 5,
  text: 'Uso o serviço regularmente para ir à base e sempre funciona perfeitamente. Recomendo!'
}];

const Testimonials: React.FC = () => {
  return <section className="py-20 bg-white w-full">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 w-full">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">O Que Nossos Clientes Dizem</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
            Veja depoimentos de clientes que utilizam nossos serviços de transfer 
            e confiam na qualidade do nosso atendimento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative">
              <div className="absolute top-4 right-4 text-primary/20">
                <Quote className="h-8 w-8 rotate-180" />
              </div>
              
              <div className="flex items-center mb-5">
                <img 
                  src={testimonial.photo} 
                  alt={testimonial.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm mr-4" 
                />
                <div>
                  <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                  <p className="text-sm text-foreground/60">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                ))}
              </div>
              
              <p className="text-foreground/80 italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button className="bg-transparent hover:bg-gray-100 text-primary border border-primary rounded-md">
            Ver Mais Depoimentos
          </Button>
        </div>
      </div>
    </section>;
};

export default Testimonials;
