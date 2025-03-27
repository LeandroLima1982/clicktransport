
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TransitionEffectProps {
  children: React.ReactNode;
  direction?: 'fade' | 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
}

const TransitionEffect: React.FC<TransitionEffectProps> = ({
  children,
  direction = 'fade',
  delay = 0,
  duration = 300,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);

  const getInitialStyles = () => {
    switch (direction) {
      case 'left':
        return 'opacity-0 -translate-x-4';
      case 'right':
        return 'opacity-0 translate-x-4';
      case 'up':
        return 'opacity-0 translate-y-4';
      case 'down':
        return 'opacity-0 -translate-y-4';
      case 'fade':
      default:
        return 'opacity-0';
    }
  };

  return (
    <div
      className={cn(
        'transition-all ease-out transform',
        isVisible ? 'opacity-100 translate-x-0 translate-y-0' : getInitialStyles(),
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

export default TransitionEffect;
