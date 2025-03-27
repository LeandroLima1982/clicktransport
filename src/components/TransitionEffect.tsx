
import React, { useEffect, ReactNode, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TransitionEffectProps {
  children: ReactNode;
  direction?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'float' | 'float-depth' | 'depth' | '3d-float';
  duration?: number;
  delay?: number;
  className?: string;
  perspective?: number;
  threshold?: number;
  rootMargin?: string;
}

const TransitionEffect: React.FC<TransitionEffectProps> = ({ 
  children,
  direction = 'fade',
  duration = 500,
  delay = 0,
  className = '',
  perspective = 1000,
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();
  
  // Adjust animations for mobile
  const effectiveDirection = isMobile && direction === 'slide-left' ? 'slide-up' : direction;
  const effectiveDuration = isMobile ? Math.min(duration, 600) : duration;
  
  useEffect(() => {
    // Intersection Observer to detect when elements come into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Add the 'visible' class when the element is in view
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, no need to observe anymore
          if (entry.target instanceof Element) {
            observer.unobserve(entry.target);
          }
        }
      });
    }, {
      root: null, // viewport
      threshold: threshold, // trigger when % of the item is visible
      rootMargin: rootMargin // margin to trigger earlier
    });
    
    // Create a ref to the current element
    const currentElement = document.querySelector('.transition-container:last-of-type');
    
    if (currentElement) {
      observer.observe(currentElement);
    }
    
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold, rootMargin]);
  
  // Create transition class based on the direction
  const getTransitionClass = () => {
    switch(effectiveDirection) {
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
      className={`transition-container ${isVisible ? getTransitionClass() : 'opacity-0'} transition-all ${className}`}
      style={{ 
        animationDuration: `${effectiveDuration}ms`,
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
        perspective: `${perspective}px`,
        transformStyle: effectiveDirection.includes('3d') || effectiveDirection.includes('depth') ? 'preserve-3d' : 'flat'
      }}
    >
      {children}
    </div>
  );
};

export default TransitionEffect;
