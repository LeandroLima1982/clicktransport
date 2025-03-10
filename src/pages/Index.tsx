
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const Index = () => {
  const { user, userRole, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect after authentication is confirmed and if user is logged in
    if (!isLoading && user) {
      console.log('User authenticated, redirecting based on role:', userRole);
      
      // Redirect based on user role
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (userRole === 'company') {
        navigate('/company/dashboard', { replace: true });
      } else if (userRole === 'driver') {
        navigate('/driver/dashboard', { replace: true });
      } else if (userRole === 'client') {
        navigate('/bookings', { replace: true });
      } else {
        // If no valid role, show the home page
        console.log('No valid role found, showing home page');
      }
    }
  }, [user, userRole, isLoading, navigate]);

  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <div className="ml-3 text-lg font-medium">Carregando...</div>
      </div>
    );
  }

  // Only render the main content if user is not authenticated
  if (!user) {
    return (
      <TransitionEffect>
        <Navbar />
        <div className="flex flex-col min-h-screen">
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
  }
  
  // If we're still here and the user is authenticated but we're
  // waiting for a redirection, show a loading indicator
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <div className="ml-3 text-lg font-medium">Redirecionando...</div>
    </div>
  );
};

export default Index;
