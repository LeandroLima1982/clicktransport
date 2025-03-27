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
  
  return <main className="w-full overflow-x-hidden">
      <Navbar />
      <div className="w-full bg-slate-50/0 relative">
        {/* Hero section */}
        <Hero />
        
        {/* Booking form - positioned to overlap with hero */}
        <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-6 -mt-16 md:-mt-32 lg:-mt-40">
          <TransitionEffect direction="up" delay={100}>
            <div className="shadow-xl rounded-2xl overflow-hidden animate-scale-in">
              <BookingForm />
            </div>
          </TransitionEffect>
        </div>
        
        {/* Transport types card carousel */}
        <div className="pt-8 md:pt-16 lg:pt-20">
          <TransportTypes />
        </div>
        
        {/* Rest of the page content */}
        <Solutions />
        <ProcessSteps />
        <Testimonials />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </main>;
};

export default Index;
