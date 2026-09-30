import React from 'react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-display text-7xl text-clay">404</p>
      <h1 className="mt-4 font-display text-3xl text-ink">This page has wandered off</h1>
      <p className="mt-2 text-sm text-ink-muted">
        The link may be broken or the piece may no longer be available.
      </p>
      <div className="mt-8 flex gap-3">
        <Button href="/">Back to home</Button>
        <Button variant="secondary" href="/shop">
          Browse the shop
        </Button>
      </div>
    </div>
  );
}
