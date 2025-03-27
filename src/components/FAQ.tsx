
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqItems = [{
  question: 'Como faço um pedido?',
  answer: 'É simples! Basta preencher o formulário de solicitação com seus dados, informar origem, destino, data e número de passageiros. Uma de nossas empresas parceiras entrará em contato em até 15 minutos.'
}, {
  question: 'É possível agendar com antecedência?',
  answer: 'Sim! Recomendamos que agende seu transfer com pelo menos 24 horas de antecedência para garantir disponibilidade, especialmente para serviços offshore e executivos.'
}, {
  question: 'Quais os métodos de pagamento?',
  answer: 'Aceitamos pagamentos via PIX, cartões de crédito/débito e transferência bancária. Em alguns casos, também oferecemos a opção de faturamento para empresas cadastradas.'
}, {
  question: 'Posso cancelar ou reagendar?',
  answer: 'Sim. Cancelamentos realizados com mais de 12 horas de antecedência não geram multa. Para reagendamentos, entre em contato conosco pelo menos 6 horas antes do horário agendado.'
}, {
  question: 'É possível solicitar recibo?',
  answer: 'Com certeza! Emitimos recibos e notas fiscais para todos os serviços realizados. Basta solicitar ao motorista ou entrar em contato com nosso suporte.'
}];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  return <section className="bg-white w-full py-20">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 w-full">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Dúvidas? Temos as respostas!</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
            Confira as perguntas mais frequentes sobre os nossos serviços de transfer executivo.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-gray-50 rounded-2xl p-6 shadow-sm">
          {faqItems.map((item, index) => (
            <div key={index} className={`border-b border-gray-200 last:border-0 transition-all duration-300 ${openIndex === index ? 'pb-6' : 'py-5'}`}>
              <button 
                className="faq-question w-full flex justify-between items-center py-2 focus:outline-none" 
                onClick={() => toggleQuestion(index)}
              >
                <span className="text-left font-medium text-lg">{item.question}</span>
                {openIndex === index ? 
                  <ChevronUp className="w-5 h-5 text-primary shrink-0 ml-4" /> : 
                  <ChevronDown className="w-5 h-5 text-primary shrink-0 ml-4" />
                }
              </button>
              
              <div 
                className={`mt-2 text-foreground/80 overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="pt-2 pb-1">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button className="rounded-md px-8 py-6 h-auto text-base font-medium bg-primary hover:bg-primary/90">
            Ver Todas as Perguntas
          </Button>
        </div>
      </div>
    </section>;
};

export default FAQ;
