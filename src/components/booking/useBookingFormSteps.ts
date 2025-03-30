
import { useState } from 'react';

export const useBookingFormSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  
  const totalSteps = 7;
  
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

  // Function to jump to a specific step (for progress bar navigation)
  const goToStep = (step: number) => {
    if (step > 0 && step <= totalSteps) {
      setDirection(step > currentStep ? 1 : -1);
      setCurrentStep(step);
    }
  };

  // Check if we're on the first or last step
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return {
    currentStep,
    setCurrentStep,
    direction,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    isFirstStep,
    isLastStep
  };
};
