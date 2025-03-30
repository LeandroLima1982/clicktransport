
import { useState } from 'react';

export const useBookingFormSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  
  const totalSteps = 3;
  
  // Function to move to next step
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Function to go back to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  return {
    currentStep,
    direction,
    totalSteps,
    goToNextStep,
    goToPreviousStep
  };
};
