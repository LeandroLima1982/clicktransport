
import React from 'react';
import { Button } from '@/components/ui/button';
import { Car, Phone, Clock } from 'lucide-react';

const CTA: React.FC = () => {
  return (
    <section className="w-full bg-[#002366] text-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 w-full py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">Reserve Seu Transfer Agora!</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-8">
          <div className="flex flex-col items-center">
            <div className="bg-[#D4AF37] rounded-full p-3 mb-4">
              <Car className="h-6 w-6 text-[#002366]" />
            </div>
            <h3 className="font-bold mb-2">Frota Moderna</h3>
            <p className="text-sm text-gray-300 text-center">
              Veículos confortáveis e seguros para seu transfer
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-[#D4AF37] rounded-full p-3 mb-4">
              <Clock className="h-6 w-6 text-[#002366]" />
            </div>
            <h3 className="font-bold mb-2">Pontualidade</h3>
            <p className="text-sm text-gray-300 text-center">
              Motoristas sempre pontuais para seu compromisso
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-[#D4AF37] rounded-full p-3 mb-4">
              <Phone className="h-6 w-6 text-[#002366]" />
            </div>
            <h3 className="font-bold mb-2">Suporte 24h</h3>
            <p className="text-sm text-gray-300 text-center">
              Atendimento disponível a qualquer hora
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <a href="#request-service">
            <Button size="lg" className="rounded-md px-8 py-6 text-base font-bold bg-[#D4AF37] hover:bg-[#C69C21] text-[#002366]">
              Solicitar Transfer
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTA;
