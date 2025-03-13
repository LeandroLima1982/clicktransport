
import React from 'react';
import TransitionEffect from '@/components/TransitionEffect';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Solutions from '@/components/Solutions';
import TransportTypes from '@/components/TransportTypes';
import ProcessSteps from '@/components/ProcessSteps';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import ServiceForm from '@/components/ServiceForm';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const {
    isLoading,
    user
  } = useAuth();

  // Show a brief loading indicator only during initial authentication check
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen w-full text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F8D748]"></div>
        <div className="ml-3 text-lg font-medium">Carregando...</div>
      </div>;
  }
  
  return (
    <TransitionEffect>
      <Navbar />
      <div className="flex flex-col min-h-screen w-full">
        <Hero />
        <div className="container mx-auto">
          <TransportTypes />
        </div>
        <Solutions />
        <div className="container mx-auto">
          <ProcessSteps />
        </div>
        <section id="request-service" className="py-16 bg-gray-50 w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="section-title mb-6">Solicite Seu Serviço</h2>
              <p className="text-foreground/70 max-w-2xl mx-auto">
                Preencha o formulário abaixo e entraremos em contato em até 30 minutos com as melhores opções para sua necessidade.
              </p>
            </div>
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
              <ServiceForm />
            </div>
          </div>
        </section>
        <Testimonials />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </TransitionEffect>
  );
};

export default Index;
