'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  bare?: boolean;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  bare,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        className={cn(
          'relative z-10 max-h-[92vh] w-full overflow-hidden rounded-t-xl bg-surface shadow-pop sm:rounded-xl border border-line animate-in zoom-in-95 duration-200 flex flex-col',
          sizes[size]
        )}
      >
        {bare ? (
          <>
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-full bg-surface/90 p-1.5 text-ink hover:bg-subtle transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="max-h-[92vh] overflow-y-auto">{children}</div>
          </>
        ) : (
          <>
            <header className="flex items-start justify-between gap-4 px-6 pt-5 pb-2 shrink-0">
              <div>
                {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
                {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="-mr-2 rounded-md p-1.5 text-ink-muted hover:bg-subtle hover:text-ink transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="max-h-[65vh] overflow-y-auto px-6 py-4 flex-1">{children}</div>
            {footer && (
              <footer className="flex justify-end gap-2 border-t border-line bg-canvas/60 px-6 py-3 shrink-0">
                {footer}
              </footer>
            )}
          </>
        )}
      </div>
    </div>
  );
}
