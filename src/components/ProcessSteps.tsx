
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Calendar, Car, CreditCard } from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'Preencha o Pedido',
    description: 'Informe os detalhes da sua viagem: origem, destino e horários',
    icon: Calendar
  },
  {
    number: 2,
    title: 'Selecione o Veículo',
    description: 'Escolha entre nossas opções de veículos para seu transporte',
    icon: Car
  },
  {
    number: 3,
    title: 'Confirme o Pedido',
    description: 'Verifique os detalhes e confirme sua reserva com facilidade',
    icon: CreditCard
  }
];

const additionalInfo = [
  {
    title: 'Receba Confirmação Imediata',
    description: 'Após a confirmação, você receberá todos os detalhes por e-mail'
  },
  {
    title: 'Pagamento Totalmente Seguro',
    description: 'Múltiplas opções de pagamento com total segurança garantida'
  },
  {
    title: 'Motorista Entrará em Contato',
    description: 'O motorista irá confirmar detalhes próximo ao horário agendado'
  }
];

const ProcessSteps: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50 w-full">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 w-full">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Seu Transfer em 3 Passos Simples</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
            Tornarmos o processo de reserva o mais simples possível. Siga os passos abaixo para 
            garantir seu transfer com rapidez e segurança.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map(step => (
            <div key={step.number} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-8 relative overflow-hidden">
              <div className="flex items-center mb-6">
                <div className="bg-primary/10 rounded-full p-3 mr-4">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-3xl font-bold text-primary/80">{step.number}</span>
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-foreground/70">{step.description}</p>
              
              {/* Decorative arrow for desktop */}
              {step.number < 3 && (
                <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                  <ArrowRight className="h-8 w-8 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-6 text-center">Informações Importantes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {additionalInfo.map((info, index) => (
              <div key={index} className="flex">
                <CheckCircle className="h-5 w-5 text-primary mt-1 mr-3 shrink-0" />
                <div>
                  <h4 className="font-semibold mb-2">{info.title}</h4>
                  <p className="text-sm text-foreground/70">{info.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <a href="#request-service">
            <Button className="rounded-md px-8 py-6 h-auto text-base font-medium bg-primary hover:bg-primary/90 transition-all duration-300">
              Solicitar Transfer Agora
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;
