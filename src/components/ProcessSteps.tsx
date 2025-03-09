
import React from 'react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    number: 1,
    title: 'Preencha o Pedido',
    description: 'Informe os detalhes da sua viagem: origem, destino e horários'
  },
  {
    number: 2,
    title: 'Selecione o Veículo Ideal',
    description: 'Escolha entre nossas opções de veículos para seu transporte'
  },
  {
    number: 3,
    title: 'Confirme o Pedido',
    description: 'Verifique os detalhes e confirme sua reserva com facilidade'
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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <span className="inline-block text-sm font-semibold text-primary mb-2">COMO FUNCIONA</span>
          <h2 className="section-title mb-6">Seu Transfer em 3 Passos Simples</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Tornarmos o processo de reserva o mais simples possível. Siga os passos abaixo para 
            garantir seu transfer com rapidez e segurança.
          </p>
        </div>

        <div className="steps-container">
          {steps.map((step) => (
            <div key={step.number} className="step-item">
              <div className="step-number">{step.number}</div>
              <h3 className="font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-foreground/70">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {additionalInfo.map((info, index) => (
            <div key={index} className="bg-gray-50 p-5 rounded-lg">
              <h4 className="font-bold mb-2 text-sm">{info.title}</h4>
              <p className="text-xs text-foreground/70">{info.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a href="#request-service">
            <Button className="rounded-md">
              Solicitar Transfer Agora
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;
