
import React from 'react';
import TransitionEffect from '@/components/TransitionEffect';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import ServiceForm from '@/components/ServiceForm';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <TransitionEffect>
      <Navbar />
      <div className="flex flex-col min-h-screen">
        <Hero />
        <Features />
        <ServiceForm />
        <Footer />
      </div>
    </TransitionEffect>
  );
};

export default Index;
