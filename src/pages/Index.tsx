
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Solutions from '@/components/Solutions';
import TransportTypes from '@/components/TransportTypes';
import ProcessSteps from '@/components/ProcessSteps';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import BookingForm from '@/components/BookingForm';
import TransitionEffect from '@/components/TransitionEffect';
import SectionController from '@/components/SectionController';

const Index = () => {
  const {
    isLoading,
    user
  } = useAuth();
  const isMobile = useIsMobile();

  // Show a brief loading indicator only during initial authentication check
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen w-full text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F8D748]"></div>
        <div className="ml-3 text-lg font-medium">Carregando...</div>
      </div>;
  }
  
  // Define sections for the homepage
  const sections = {
    hero: (
      <section id="hero" key="hero">
        <Hero />
      </section>
    ),
    booking: (
      <section id="booking" key="booking" className="w-full bg-gray-50 py-8">
        <div className="relative z-10 max-w-[900px] mx-auto px-4 md:px-6">
          <TransitionEffect direction="up" delay={100}>
            <div className="shadow-2xl rounded-2xl overflow-hidden animate-scale-in">
              <BookingForm />
            </div>
          </TransitionEffect>
        </div>
      </section>
    ),
    'transport-types': (
      <section id="transport-types" key="transport-types" className="pt-8 md:pt-16 lg:pt-20">
        <TransportTypes />
      </section>
    ),
    solutions: (
      <section id="solutions" key="solutions">
        <Solutions />
      </section>
    ),
    'process-steps': (
      <section id="process-steps" key="process-steps">
        <ProcessSteps />
      </section>
    ),
    testimonials: (
      <section id="testimonials" key="testimonials">
        <Testimonials />
      </section>
    ),
    faq: (
      <section id="faq" key="faq">
        <FAQ />
      </section>
    ),
    cta: (
      <section id="cta" key="cta">
        <CTA />
      </section>
    )
  };
  
  return <main className="w-full overflow-x-hidden">
      <Navbar />
      <div className="w-full bg-slate-50/0 relative">
        <SectionController defaultSections={sections}>
          {/* We predefine sections above, but could also be done like this: */}
          {/* 
          <section id="hero"><Hero /></section>
          <section id="booking">...</section>
          */}
        </SectionController>
        <Footer />
      </div>
    </main>;
};

export default Index;
