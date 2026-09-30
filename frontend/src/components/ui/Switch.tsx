'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hideLabel?: boolean;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, hideLabel, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={hideLabel ? label : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn('inline-flex items-center gap-2.5 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer')}
    >
      <span
        className={cn(
          'relative h-5 w-9 rounded-full transition-colors duration-150 ease-out',
          checked ? 'bg-success' : 'bg-line-strong'
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-xs transition-transform duration-150 ease-out',
            checked && 'translate-x-4'
          )}
        />
      </span>
      {!hideLabel && <span className="text-sm text-ink">{label}</span>}
    </button>
  );
}
