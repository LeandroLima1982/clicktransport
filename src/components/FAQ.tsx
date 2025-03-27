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
  return <section className="bg-white w-full py-[55px]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 w-full">
        <div className="text-center mb-12">
          <h2 className="section-title mb-6">Dúvidas? Temos as respostas!</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Confira as perguntas mais frequentes sobre os nossos serviços de transfer executivo.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqItems.map((item, index) => <div key={index} className="faq-item">
              <button className="faq-question" onClick={() => toggleQuestion(index)}>
                <span>{item.question}</span>
                {openIndex === index ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-primary" />}
              </button>
              {openIndex === index && <div className="mt-2 text-sm text-foreground/70">
                  {item.answer}
                </div>}
            </div>)}
        </div>

        <div className="text-center mt-10">
          <Button className="rounded-md">
            Ver Todas as Perguntas
          </Button>
        </div>
      </div>
    </section>;
};
export default FAQ;