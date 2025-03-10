
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
  const { isLoading, user } = useAuth();
  const isMobile = useIsMobile();

  // Show a brief loading indicator only during initial authentication check
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1F1F1F] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F8D748]"></div>
        <div className="ml-3 text-lg font-medium">Carregando...</div>
      </div>
    );
  }

  // App-like mobile container
  if (isMobile) {
    return (
      <TransitionEffect>
        <div className="flex flex-col min-h-screen overflow-hidden bg-[#1F1F1F] text-white">
          {/* Mobile app-like header with greeting */}
          <div className="app-header">
            <div className="container mx-auto px-4 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-lg font-bold">
                    {user ? `Olá, ${user.user_metadata?.firstName || 'Usuário'}` : 'Bem-vindo'}
                  </h1>
                  <p className="text-xs text-white/70">Precisa de transporte hoje?</p>
                </div>
                <div className="relative">
                  {user ? (
                    <div className="w-10 h-10 rounded-full bg-[#F8D748] flex items-center justify-center text-[#1F1F1F]">
                      {user.user_metadata?.firstName?.[0] || 'U'}
                    </div>
                  ) : (
                    <div className="px-3 py-1 rounded-full border border-white/30 text-xs">
                      Entrar
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Unified scrollable content area with app-like styling */}
          <div className="flex-1 overflow-auto">
            <Hero />
            <div className="container mx-auto px-4 py-6">
              <ServiceForm />
            </div>
            <div className="bg-[#262626] py-8">
              <div className="container mx-auto px-4">
                <h2 className="text-xl font-bold mb-6 text-white">Serviços</h2>
                <Solutions />
              </div>
            </div>
            <div className="py-8">
              <div className="container mx-auto px-4">
                <h2 className="text-xl font-bold mb-6 text-white">Nossos Veículos</h2>
                <TransportTypes />
              </div>
            </div>
            <div className="bg-[#262626] py-8">
              <div className="container mx-auto px-4">
                <h2 className="text-xl font-bold mb-6 text-white">Como Funciona</h2>
                <ProcessSteps />
              </div>
            </div>
            <div className="py-8">
              <div className="container mx-auto px-4">
                <h2 className="text-xl font-bold mb-6 text-white">Avaliações</h2>
                <Testimonials />
              </div>
            </div>
            <div className="bg-[#262626] py-8">
              <div className="container mx-auto px-4">
                <h2 className="text-xl font-bold mb-6 text-white">Perguntas Frequentes</h2>
                <FAQ />
              </div>
            </div>
            <CTA />
            <Footer />
          </div>
          
          {/* App-style navigation at the bottom - rendered by MobileMenu component */}
          <div className="h-16">
            {/* Spacer for the fixed position bottom nav */}
          </div>
        </div>
        
        <Navbar />
      </TransitionEffect>
    );
  }

  // Always render the main home page content for all users
  return (
    <TransitionEffect>
      <Navbar />
      <div className="flex flex-col min-h-screen w-full max-w-none">
        <Hero />
        <Solutions />
        <TransportTypes />
        <ProcessSteps />
        <ServiceForm />
        <Testimonials />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </TransitionEffect>
  );
};

export default Index;
