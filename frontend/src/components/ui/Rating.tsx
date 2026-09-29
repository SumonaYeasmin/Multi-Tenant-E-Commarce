import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RatingProps {
  value: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function Rating({ value, size = 'sm', className }: RatingProps) {
  const px = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <span
      className={cn('inline-flex items-center gap-0.5', className)}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            px,
            i <= Math.round(value) ? 'fill-ink text-ink' : 'fill-line text-line'
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}
