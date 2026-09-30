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
    if (!token) {
      setError('Invalid or missing reset token. Please request a new reset code.');
      return;
    }
    if (pw.a.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (pw.a !== pw.b) {
      setError('Passwords don’t match');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken: token,
          newPassword: pw.a,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Failed to reset password. Please request a new code.';
        setError(errMsg);
        return;
      }

      // Save tokens and user info for instant auto-login
      if (data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }
        if (data.data.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
      }

      const next = searchParams.get('next') ?? '/';
      router.push(next);
    } catch (err) {
      setError('Unable to connect to server. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="New password"
        type="password"
        value={pw.a}
        onChange={(e) => setPw({ ...pw, a: e.target.value })}
        autoComplete="new-password"
        placeholder="At least 6 characters"
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
