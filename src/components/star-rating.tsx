'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  size?: number;
  onRate?: (rating: number) => void;
  readOnly?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  totalStars = 5,
  size = 16,
  onRate,
  readOnly = false,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  const handleRate = (rate: number) => {
    if (readOnly || !onRate) return;
    setCurrentRating(rate);
    onRate(rate);
  };

  const starIcon = (index: number) => {
    const fill =
      hoverRating >= index
        ? 'fill-yellow-400 text-yellow-400'
        : currentRating >= index
        ? 'fill-yellow-400 text-yellow-400'
        : 'fill-muted text-muted-foreground';

    return (
      <Star
        key={index}
        size={size}
        className={cn('transition-colors', { 'cursor-pointer': !readOnly }, fill)}
        onMouseEnter={() => !readOnly && setHoverRating(index)}
        onMouseLeave={() => !readOnly && setHoverRating(0)}
        onClick={() => handleRate(index)}
      />
    );
  };

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: totalStars }, (_, i) => starIcon(i + 1))}
    </div>
  );
} 