
import React, { useEffect, ReactNode } from 'react';

interface TransitionEffectProps {
  children: ReactNode;
  direction?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'float' | 'float-depth' | 'depth' | '3d-float';
  duration?: number;
  delay?: number;
  className?: string;
  perspective?: number;
}

const TransitionEffect: React.FC<TransitionEffectProps> = ({ 
  children,
  direction = 'fade',
  duration = 500,
  delay = 0,
  className = '',
  perspective = 1000
}) => {
  useEffect(() => {
    // Intersection Observer to detect when elements come into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Add the 'visible' class when the element is in view
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      root: null, // viewport
      threshold: 0.1, // trigger when 10% of the item is visible
      rootMargin: '0px 0px -50px 0px' // negative bottom margin to trigger earlier
    });
    
    // Observe all stagger items
    document.querySelectorAll('.stagger-item').forEach(item => {
      observer.observe(item);
    });
    
    return () => {
      // Cleanup
      document.querySelectorAll('.stagger-item').forEach(item => {
        observer.unobserve(item);
      });
    };
  }, []);
  
  // Create transition class based on the direction
  const getTransitionClass = () => {
    switch(direction) {
      case 'slide-up':
        return 'animate-fade-in-up';
      case 'slide-down':
        return 'animate-fade-in-down';
      case 'slide-left':
        return 'animate-slide-in-left';
      case 'slide-right':
        return 'animate-slide-in-right';
      case 'scale':
        return 'animate-scale-in';
      case 'float':
        return 'animate-float';
      case 'float-depth':
        return 'animate-float-depth';
      case 'depth':
        return 'animate-depth';
      case '3d-float':
        return 'animate-float-3d';
      case 'fade':
      default:
        return 'animate-fade-in';
    }
  };
  
  // Return the children wrapped in a div with transition classes
  return (
    <div 
      className={`${getTransitionClass()} transition-all ${className}`}
      style={{ 
        animationDuration: `${duration}ms`,
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
        perspective: `${perspective}px`,
        transformStyle: direction.includes('3d') || direction.includes('depth') ? 'preserve-3d' : 'flat'
      }}
    >
      {children}
    </div>
  );
};

export default TransitionEffect;
