
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

const Index = () => {
  const {
    isLoading,
    user
  } = useAuth();

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
    <main className="w-full">
      <Navbar />
      <div className="w-full bg-slate-50/0">
        <Hero />
        <TransportTypes />
        <div id="request-service" className="relative max-w-[1000px] mx-auto py-12 md:px-6 px-4 scroll-mt-24">
          <div className="shadow-xl animate-scale-in">
            <BookingForm />
          </div>
        </div>
        <Solutions />
        <ProcessSteps />
        <Testimonials />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </main>
  );
};

export default Index;
