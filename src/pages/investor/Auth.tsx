
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import InvestorLoginForm from '@/components/investor/InvestorLoginForm';
import TransitionEffect from '@/components/TransitionEffect';

const InvestorAuth: React.FC = () => {
  return (
    <TransitionEffect>
      <div className="container mx-auto px-4 py-8 md:py-16 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-0">
            <InvestorLoginForm />
          </CardContent>
        </Card>
      </div>
    </TransitionEffect>
  );
};

export default InvestorAuth;
