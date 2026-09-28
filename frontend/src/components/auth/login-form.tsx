'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('nusrat.jahan@gmail.com');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};

    if (mode === 'email') {
      if (!/^\S+@\S+\.\S+$/.test(email)) er.email = 'Enter a valid email';
      if (password.length < 6) er.password = 'Password must be at least 6 characters';
    } else if (!/^01\d{9}$/.test(phone.replace(/\D/g, ''))) {
      er.phone = 'Enter an 11-digit mobile number';
    }

    setErrors(er);
    if (Object.keys(er).length) return;

    setLoading(true);
    try {
      if (mode === 'phone') {
        router.push(`/verify?type=phone&to=${encodeURIComponent(phone)}&next=${encodeURIComponent(next)}`);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If account is not verified yet, backend sent OTP -> redirect to verify
        if (typeof data.message === 'string' && data.message.toLowerCase().includes('not verified')) {
          router.push(`/verify?type=otp&to=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
          return;
        }

        const errMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Invalid email or password';
        setErrors({ password: errMsg });
        return;
      }

      // Save tokens and user info
      if (data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }
        if (data.data.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
      }

      // Redirect to next destination (default: /)
      router.push(next);
    } catch (err) {
      setErrors({ password: 'Unable to connect to server. Please check backend connection.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Email / Phone Tab Selector */}
      <div className="grid grid-cols-2 rounded-md bg-subtle p-1 text-sm" role="tablist">
        {(['email', 'phone'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cn(
              'rounded py-1.5 font-medium transition-all',
              mode === m ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
            )}
          >
            {m === 'email' ? 'Email' : 'Phone (OTP)'}
          </button>
        ))}
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        {mode === 'email' ? (
          <>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <div>
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                hint="Any 6+ characters works in this demo"
              />
              <Link
                href="/forgot-password"
                className="mt-2 inline-block text-xs text-ink-soft hover:text-ink underline"
              >
                Forgot password?
              </Link>
            </div>
            <Checkbox
              checked={remember}
              onChange={setRemember}
              label="Keep me signed in on this device"
            />
          </>
        ) : (
          <Input
            label="Mobile number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            placeholder="01XXX-XXXXXX"
            hint="We’ll text you a 6-digit code"
          />
        )}

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {mode === 'email' ? 'Sign in' : 'Send code'}
        </Button>
      </form>

      {/* Social / Alternative Actions */}
      <div className="my-6 flex items-center gap-3 text-xs text-ink-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <Button
        variant="secondary"
        size="lg"
        fullWidth
        type="button"
        onClick={() => router.push(next)}
      >
        <span className="font-bold text-[#4285F4] mr-2">G</span> Continue with Google
      </Button>

      <p className="mt-4 text-center text-xs text-ink-muted">
        <Link
          href={next === '/' ? '/checkout' : next}
          className="hover:text-ink underline"
        >
          Continue as guest
        </Link>
      </p>
    </>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="h-48 animate-pulse rounded bg-subtle" />}>
      <LoginFormContent />
    </Suspense>
  );
}
