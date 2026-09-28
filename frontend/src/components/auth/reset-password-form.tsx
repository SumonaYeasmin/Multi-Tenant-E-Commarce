'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [pw, setPw] = useState({ a: '', b: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.a.length < 8) {
      setError('Use at least 8 characters');
      return;
    }
    if (pw.a !== pw.b) {
      setError('Passwords don’t match');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);

    router.push('/login');
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="New password"
        type="password"
        value={pw.a}
        onChange={(e) => setPw({ ...pw, a: e.target.value })}
        autoComplete="new-password"
        placeholder="At least 8 characters"
      />
      <Input
        label="Confirm password"
        type="password"
        value={pw.b}
        onChange={(e) => setPw({ ...pw, b: e.target.value })}
        error={error}
        autoComplete="new-password"
        placeholder="Re-enter your password"
      />
      <Button type="submit" size="lg" fullWidth loading={loading}>
        Update password
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={<div className="h-48 animate-pulse rounded bg-subtle" />}>
      <ResetPasswordFormContent />
    </Suspense>
  );
}
