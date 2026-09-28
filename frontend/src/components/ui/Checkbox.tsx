import React, { useId } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
  ariaLabel
}: CheckboxProps) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-start gap-2.5',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <span className="relative mt-0.5 flex h-4 w-4 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-label={ariaLabel}
          onChange={(e) => onChange(e.target.checked)}
          className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-line-strong bg-surface checked:border-ink checked:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
        />
        <Check
          className="pointer-events-none absolute inset-0 m-auto h-3 w-3 text-canvas opacity-0 peer-checked:opacity-100"
          strokeWidth={3}
          aria-hidden
        />
      </span>
      {(label || description) && (
        <span className="text-sm leading-5">
          {label && <span className="text-ink">{label}</span>}
          {description && <span className="block text-xs text-ink-muted">{description}</span>}
        </span>
      )}
    </label>
  );
}
