
import React from 'react';
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
import { useEffect } from 'react';

const Index = () => {
  const { user, userRole, isLoading } = useAuth();
  const navigate = useNavigate();

  // Handle redirection logic separately from rendering
  useEffect(() => {
    // Only redirect after authentication is confirmed and if user is logged in
    // We add a short timeout to ensure any auth state has settled
    const redirectTimeout = setTimeout(() => {
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
          // If no valid role, just stay on home page
          console.log('No valid role found, staying on home page');
        }
      }
    }, 500); // Short delay to allow auth state to settle
    
    return () => clearTimeout(redirectTimeout);
  }, [user, userRole, isLoading, navigate]);

  // Show a brief loading indicator only during initial authentication check
  // but limit it to 1 second max to prevent infinite loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <div className="ml-3 text-lg font-medium">Carregando...</div>
      </div>
    );
  }

  // Always render the main home page content unless we're redirecting a logged-in user
  // This ensures that even if there's an issue with auth, the site remains functional
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
};

export default Index;
