'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft">
          <MailCheck className="h-8 w-8 text-success" aria-hidden />
        </div>
        <p className="mt-4 text-sm text-ink-muted leading-relaxed">
          We sent a password reset link to <b className="text-ink font-semibold">{email}</b>. Please check your inbox.
        </p>
        <Link
          href="/reset-password"
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-ink font-medium text-canvas hover:bg-ink/90"
        >
          Proceed to reset password
        </Link>
        <button
          type="button"
          onClick={() => setIsSubmitted(false)}
          className="mt-4 text-center text-sm text-ink-muted underline hover:text-ink"
        >
          Didn’t receive email? Try another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        autoComplete="email"
        placeholder="your.email@example.com"
      />
      <Button type="submit" size="lg" fullWidth loading={loading}>
        Send reset link
      </Button>
    </form>
  );
}
