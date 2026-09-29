import React from 'react';
import { cn } from '@/lib/utils';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'clay';

const tones: Record<Tone, string> = {
  neutral: 'bg-subtle text-ink-soft',
  success: 'bg-[#E3EFE8] text-[#2F6B4F]',
  warning: 'bg-[#F8EDD6] text-[#8A5A12]',
  danger: 'bg-[#FBE9E7] text-[#B42318]',
  info: 'bg-[#E4EDF6] text-[#2B5C8A]',
  clay: 'bg-[#F3E6DF] text-[#7C311B]',
};

const dots: Record<Tone, string> = {
  neutral: 'bg-ink-muted',
  success: 'bg-[#2F6B4F]',
  warning: 'bg-[#8A5A12]',
  danger: 'bg-[#B42318]',
  info: 'bg-[#2B5C8A]',
  clay: 'bg-[#9A3F24]',
};

export interface BadgeProps {
  tone?: Tone;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  tone = 'neutral',
  dot,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className
      )}
    >
      {dot && (
        <span
          className={cn('inline-block h-1.5 w-1.5 shrink-0 rounded-full', dots[tone])}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
}
