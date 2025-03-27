
import React, { useState, useEffect } from 'react';
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
import BookingForm from '@/components/BookingForm';
import Features from '@/components/Features';
import TransitionEffect from '@/components/TransitionEffect';

const Index = () => {
  const { isLoading, user } = useAuth();
  const isMobile = useIsMobile();

  // Show a brief loading indicator only during initial authentication check
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F8D748]"></div>
        <div className="ml-3 text-lg font-medium">Carregando...</div>
      </div>
    );
  }
  
  return (
    <main className="w-full overflow-x-hidden">
      <Navbar />
      <div className="w-full">
        <Hero />
        
        <div className="py-8 md:py-16"></div>
        
        <TransitionEffect direction="fade" duration={800} delay={200}>
          <TransportTypes />
        </TransitionEffect>
        
        <div className="py-10 md:py-16"></div>
        
        <TransitionEffect direction="fade" duration={800} delay={200}>
          <Solutions />
        </TransitionEffect>
        
        <div className="py-10 md:py-16"></div>
        
        <TransitionEffect direction="fade" duration={800} delay={200}>
          <Features />
        </TransitionEffect>
        
        <div className="py-10 md:py-16"></div>
        
        <div id="request-service" className="relative max-w-[1000px] mx-auto px-4 md:px-6 py-8 md:py-12 scroll-mt-24">
          <div className="shadow-xl transform transition-all duration-500 hover:shadow-2xl rounded-xl perspective-container">
            <BookingForm />
          </div>
        </div>
        
        <div className="py-10 md:py-16"></div>
        
        <TransitionEffect direction="fade" duration={800} delay={200}>
          <ProcessSteps />
        </TransitionEffect>
        
        <div className="py-10 md:py-16"></div>
        
        <TransitionEffect direction="fade" duration={800} delay={200}>
          <Testimonials />
        </TransitionEffect>
        
        <div className="py-10 md:py-16"></div>
        
        <TransitionEffect direction="fade" duration={800} delay={200}>
          <FAQ />
        </TransitionEffect>
        
        <div className="py-10 md:py-16"></div>
        
        <CTA />
        <Footer />
      </div>
    </main>
  );
};

export default Index;
