
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50 -z-10" />
      <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-center bg-no-repeat bg-cover opacity-10 -z-10" />
      
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div>
              <p className="inline-block px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full mb-4">
                Premium Transfer Services
              </p>
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold leading-tight tracking-tight">
                Connect with the best
                <span className="text-primary block mt-1">transportation companies</span>
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-foreground/80 max-w-lg">
              ClickTransfer is the premier marketplace connecting clients with transportation companies for corporate, offshore, and tourist transfer services.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/services">
                <Button size="lg" className="rounded-full px-8 py-6 text-base">
                  Request Service <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth?register=true&type=company">
                <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-base">
                  Register Your Company
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center space-x-8 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white" />
                ))}
              </div>
              <p className="text-sm text-foreground/70">
                <span className="font-semibold">500+</span> transport companies trust us
              </p>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <div className="relative h-[500px] w-full overflow-hidden rounded-2xl animate-slide-in">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
              <div className="glass-morphism absolute bottom-10 left-10 right-10 p-6 rounded-xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-foreground/70">Premium Service</p>
                    <h3 className="text-xl font-bold">Executive Transfer</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground/70">From</p>
                    <p className="text-xl font-bold">$99</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm">Luxury Vehicles</span>
                  </div>
                  <Link to="/services">
                    <Button variant="ghost" className="rounded-full" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
