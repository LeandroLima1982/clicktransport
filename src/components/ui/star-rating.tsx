
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  initialRating?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  initialRating = 0,
  max = 5,
  size = 'md',
  readOnly = false,
  onChange,
  className
}: StarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const starSize = sizes[size];

  const handleRatingChange = (newRating: number) => {
    if (readOnly) return;
    
    setRating(newRating);
    if (onChange) {
      onChange(newRating);
    }
  };

  return (
    <div className={cn("flex", className)}>
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = hoverRating ? hoverRating >= starValue : rating >= starValue;
        
        return (
          <Star
            key={index}
            className={cn(
              starSize,
              "cursor-pointer transition-colors",
              isFilled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
              readOnly && "cursor-default"
            )}
            onClick={() => handleRatingChange(starValue)}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
          />
        );
      })}
    </div>
  );
}
