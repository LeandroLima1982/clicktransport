
import React from 'react';
import { Car, Calendar, MapPin, Shield } from 'lucide-react';

const features = [
  {
    title: 'Premium Fleet',
    description: 'Access to a wide range of luxury and specialized vehicles for any type of transfer.',
    icon: Car,
  },
  {
    title: 'Real-Time Tracking',
    description: "Track your driver's location and status updates in real-time for peace of mind.",
    icon: MapPin,
  },
  {
    title: 'Easy Scheduling',
    description: 'Book in advance or on-demand with our intuitive scheduling system.',
    icon: Calendar,
  },
  {
    title: 'Secure Payments',
    description: 'Safe and transparent payment processing for all your transportation needs.',
    icon: Shield,
  },
];

const Features: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Experience Premium Transportation Services</h2>
          <p className="text-lg text-foreground/70">
            ClickTransfer connects you with verified transportation providers for seamless corporate and tourist transfer experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-8 rounded-2xl smooth-shadow hover:translate-y-[-5px] transition-all duration-300 bg-white"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-6">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-foreground/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
