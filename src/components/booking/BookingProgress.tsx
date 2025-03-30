
import React from 'react';
import { Check, MapPin, Calendar, Users, CreditCard } from 'lucide-react';

interface BookingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const BookingProgress: React.FC<BookingProgressProps> = ({ currentStep, totalSteps }) => {
  const steps = [
    { icon: MapPin, label: 'Trajeto' },
    { icon: Calendar, label: 'Data' },
    { icon: Users, label: 'Detalhes' },
    { icon: CreditCard, label: 'Confirmação' }
  ];

  return (
    <div className="w-full py-3 px-1">
      <div className="flex justify-between items-center relative">
        {/* Progress bar */}
        <div className="absolute h-2 bg-blue-900/30 inset-x-0 top-1/2 -translate-y-1/2 z-0 rounded-full">
          <div 
            className="h-full bg-amber-400 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
          />
        </div>
        
        {/* Step indicators */}
        {steps.slice(0, totalSteps).map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStep;
          const isActive = index === currentStep - 1;
          
          return (
            <div key={index} className="flex flex-col items-center z-10">
              <div 
                className={`w-11 h-11 rounded-full flex items-center justify-center 
                          transition-all duration-300 ${
                            isCompleted ? 'bg-amber-400 text-[#002366] shadow-lg' : 
                            isActive ? 'bg-white/20 border-2 border-amber-400 text-amber-400' : 
                            'bg-blue-900/30 border-2 border-blue-800/30 text-gray-300'
                          }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`mt-2 text-xs font-medium transition-colors duration-300 ${
                isCompleted || isActive ? 'text-white' : 'text-gray-300'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingProgress;
