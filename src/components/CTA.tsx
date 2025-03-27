
import React from 'react';
import { Button } from '@/components/ui/button';
import { Car, Phone, Clock, Shield, ArrowRight } from 'lucide-react';

const CTA: React.FC = () => {
  const scrollToBookingForm = () => {
    document.getElementById('request-service')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  return <section className="w-full bg-[#002366] text-white py-20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 w-full relative z-10">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Reserve Seu Transfer Agora!</h2>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">
            Experimente o melhor serviço de transfer executivo com motoristas profissionais e veículos de qualidade.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto mb-14">
          <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 text-center">
            <div className="bg-[#D4AF37] rounded-full p-3 w-14 h-14 mx-auto mb-5 flex items-center justify-center">
              <Car className="h-6 w-6 text-[#002366]" />
            </div>
            <h3 className="font-bold text-xl mb-3">Frota Moderna</h3>
            <p className="text-white/80">
              Veículos confortáveis e seguros para seu transfer
            </p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 text-center">
            <div className="bg-[#D4AF37] rounded-full p-3 w-14 h-14 mx-auto mb-5 flex items-center justify-center">
              <Clock className="h-6 w-6 text-[#002366]" />
            </div>
            <h3 className="font-bold text-xl mb-3">Pontualidade</h3>
            <p className="text-white/80">
              Motoristas sempre pontuais para seu compromisso
            </p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 text-center">
            <div className="bg-[#D4AF37] rounded-full p-3 w-14 h-14 mx-auto mb-5 flex items-center justify-center">
              <Phone className="h-6 w-6 text-[#002366]" />
            </div>
            <h3 className="font-bold text-xl mb-3">Suporte 24h</h3>
            <p className="text-white/80">
              Atendimento disponível a qualquer hora
            </p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 text-center">
            <div className="bg-[#D4AF37] rounded-full p-3 w-14 h-14 mx-auto mb-5 flex items-center justify-center">
              <Shield className="h-6 w-6 text-[#002366]" />
            </div>
            <h3 className="font-bold text-xl mb-3">100% Seguro</h3>
            <p className="text-white/80">
              Segurança e tranquilidade garantidas
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            size="lg" 
            className="rounded-md px-8 py-7 text-lg font-bold bg-[#D4AF37] hover:bg-[#C69C21] text-[#002366] h-auto group"
            onClick={scrollToBookingForm}
          >
            <span className="flex items-center">
              Solicitar Transfer Agora
              <ArrowRight className="ml-2 h-5 w-5 group-hover:animate-slide-right" />
            </span>
          </Button>
        </div>
      </div>
    </section>;
};

export default CTA;
