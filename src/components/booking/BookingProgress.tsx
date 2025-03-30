
import React from 'react';
import { Check, MapPin, Calendar, Users, Car, CreditCard, CheckCircle } from 'lucide-react';

interface BookingProgressProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const BookingProgress: React.FC<BookingProgressProps> = ({ 
  currentStep, 
  totalSteps,
  onStepClick 
}) => {
  const steps = [
    { icon: MapPin, label: 'Trajeto', step: 1 },
    { icon: Calendar, label: 'Data', step: 2 },
    { icon: Car, label: 'Veículo', step: 3 },
    { icon: CreditCard, label: 'Pagamento', step: 4 },
    { icon: Users, label: 'Pessoas', step: 5 },
    { icon: CheckCircle, label: 'Confirmar', step: 6 },
    { icon: Check, label: 'Concluído', step: 7 }
  ];

  // Current progress percentage
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  // For mobile, we'll show just the current step and the next/previous steps
  const visibleSteps = () => {
    // On small screens, show limited steps
    if (window.innerWidth < 640) {
      // Show current step and next step (if available)
      return steps.slice(Math.max(0, currentStep - 2), Math.min(currentStep + 1, totalSteps));
    }
    // On medium screens, show more steps
    if (window.innerWidth < 768) {
      return steps.slice(Math.max(0, currentStep - 2), Math.min(currentStep + 2, totalSteps));
    }
    // On larger screens, show all steps
    return steps;
  };

  return (
    <div className="w-full pt-3 pb-2 px-1 md:px-2">
      {/* Mobile-friendly step indicator */}
      <div className="text-center mb-2 text-white text-sm md:hidden">
        <span className="font-medium">Etapa {currentStep}</span> de {totalSteps}
      </div>
      
      <div className="flex justify-between items-center relative">
        {/* Progress bar - smoother and more visible */}
        <div className="absolute h-2 bg-blue-900/30 inset-x-0 top-1/2 -translate-y-1/2 z-0 rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-400 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Step indicators - responsive and touch-friendly */}
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStep - 1;
          const isActive = index === currentStep - 1;
          const isVisible = window.innerWidth >= 768 || 
                            (index >= currentStep - 2 && index <= currentStep);
          
          // Skip rendering steps that aren't visible on mobile
          if (!isVisible && window.innerWidth < 768) return null;
          
          return (
            <div 
              key={index} 
              className={`flex flex-col items-center z-10 transition-opacity duration-300 ${
                isVisible ? 'opacity-100' : 'opacity-0 md:opacity-100'
              }`}
              onClick={() => isCompleted && onStepClick && onStepClick(index + 1)}
            >
              <div 
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center 
                          cursor-pointer transition-all duration-300 ${
                            isCompleted ? 'bg-amber-400 text-[#002366] shadow-lg' : 
                            isActive ? 'bg-white/20 border-2 border-amber-400 text-amber-400' : 
                            'bg-blue-900/30 border-2 border-blue-800/30 text-gray-300'
                          } ${isCompleted && onStepClick ? 'hover:scale-110' : ''}`}
              >
                {isCompleted ? 
                  <Check className="w-4 h-4 md:w-5 md:h-5" /> : 
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                }
              </div>
              <span className={`mt-1 text-[10px] md:text-xs text-center font-medium transition-colors duration-300 ${
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
