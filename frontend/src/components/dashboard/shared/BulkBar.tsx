'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function BulkBar({
  count,
  onClear,
  children
}: {
  count: number;
  onClear: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="pointer-events-auto flex flex-wrap items-center gap-3 rounded-lg bg-ink px-4 py-2.5 text-sm text-canvas shadow-pop"
            role="toolbar"
            aria-label="Bulk actions"
          >
            <span className="tabular-nums font-medium">{count} selected</span>
            <span className="h-4 w-px bg-canvas/20" />
            <div className="flex flex-wrap items-center gap-1 [&_button:hover]:bg-canvas/10 [&_button]:rounded-md [&_button]:px-2.5 [&_button]:py-1 [&_button]:cursor-pointer">
              {children}
            </div>
            <button
              onClick={onClear}
              className="text-canvas/60 hover:text-canvas cursor-pointer ml-1"
            >
              Clear
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
