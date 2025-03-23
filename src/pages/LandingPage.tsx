
import React from 'react';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import CTA from '@/components/CTA';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import TransitionEffect from '@/components/TransitionEffect';

const LandingPage: React.FC = () => {
  return (
    <div className="w-full">
      <TransitionEffect>
        <Hero />
        <Features />
        <Testimonials />
        <FAQ />
        <CTA />
      </TransitionEffect>
    </div>
  );
};

export default LandingPage;
