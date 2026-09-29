import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className, id, rows = 4, ...rest }: TextareaProps) {
  const autoId = useId();
  const tid = id ?? autoId;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={tid} className="mb-1.5 block text-[13px] font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        id={tid}
        rows={rows}
        aria-invalid={!!error}
        className={cn(
          'w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted/70 transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-2 focus:ring-clay/25',
          error ? 'border-danger focus:border-danger' : 'border-line-strong focus:border-clay'
        )}
        {...rest}
      />
      {error ? (
        <p className="mt-1 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}
