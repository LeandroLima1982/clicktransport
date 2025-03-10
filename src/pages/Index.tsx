
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
          {/* Mobile app-like header with logo and menu */}
          <div className="app-header">
            <div className="app-logo">
              <div className="app-logo-icon">
                <span className="text-black text-xl font-bold">T</span>
              </div>
              <span className="app-logo-text">transfer</span>
            </div>
            <div className="app-menu-button">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            </div>
          </div>
          
          {/* Unified scrollable content area with app-like styling */}
          <div className="flex-1 overflow-auto pb-16">
            <Hero />
            
            <div className="container mx-auto px-4 py-6">
              <h2 className="text-xl font-bold mb-4 text-white">Serviços</h2>
              <Solutions />
            </div>

            <div className="container mx-auto px-4 py-6">
              <h2 className="text-xl font-bold mb-4 text-white">Nossos Veículos</h2>
              <TransportTypes />
            </div>
            
            <div className="container mx-auto px-4 py-6">
              <h2 className="text-xl font-bold mb-4 text-white">Como Funciona</h2>
              <ProcessSteps />
            </div>
            
            <div className="container mx-auto px-4 py-6">
              <h2 className="text-xl font-bold mb-4 text-white">Avaliações</h2>
              <Testimonials />
            </div>
            
            <div className="container mx-auto px-4 py-6">
              <h2 className="text-xl font-bold mb-4 text-white">Perguntas Frequentes</h2>
              <FAQ />
            </div>
            
            <CTA />
            <Footer />
          </div>
          
          {/* App-style bottom tab navigation */}
          <div className="tab-bar">
            <div className="tab-item active">
              <svg className="tab-item-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Início</span>
            </div>
            <div className="tab-item">
              <svg className="tab-item-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Sobre</span>
            </div>
            <div className="tab-item">
              <svg className="tab-item-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Conta</span>
            </div>
            <div className="tab-item">
              <svg className="tab-item-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Favoritos</span>
            </div>
          </div>
        </div>
      </TransitionEffect>
    );
  }

  // Desktop version
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
