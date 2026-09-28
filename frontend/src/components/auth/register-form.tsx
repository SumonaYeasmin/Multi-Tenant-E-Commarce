'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';

function getPasswordStrength(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'] as const;

export function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [marketing, setMarketing] = useState(true);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const pwStrength = getPasswordStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};

    if (form.name.trim().length < 2) {
      er.name = 'Enter your full name';
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      er.email = 'Enter a valid email';
    }
    if (!/^01\d{9}$/.test(form.phone.replace(/\D/g, ''))) {
      er.phone = 'Enter an 11-digit mobile number';
    }
    if (pwStrength < 2) {
      er.password = 'Use at least 8 characters with a mix of letters and numbers';
    }
    if (!terms) {
      er.terms = 'You must accept the terms';
    }

    setErrors(er);
    if (Object.keys(er).length > 0) return;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Registration failed. Please try again.';
        setErrors({ email: errMsg });
        return;
      }

      // Registration success -> redirect to verify OTP
      router.push(`/verify?type=phone&to=${encodeURIComponent(form.phone || form.email)}&next=/`);
    } catch (err) {
      setErrors({ email: 'Unable to connect to server. Please check backend connection.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="Full name"
        autoComplete="name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        error={errors.name}
      />

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email}
      />

      <Input
        label="Mobile number"
        type="tel"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        error={errors.phone}
        placeholder="01XXX-XXXXXX"
        hint="We’ll verify this with a one-time code"
      />

      <div>
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
        />
        {form.password && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-all duration-200',
                    i < pwStrength
                      ? pwStrength < 2
                        ? 'bg-danger'
                        : pwStrength < 4
                        ? 'bg-warning'
                        : 'bg-success'
                      : 'bg-line'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-ink-muted">
              {strengthLabels[pwStrength]}
            </span>
          </div>
        )}
      </div>

      <Checkbox
        checked={marketing}
        onChange={setMarketing}
        label="Email me about new collections and offers"
      />

      <div>
        <Checkbox
          checked={terms}
          onChange={setTerms}
          label={
            <>
              I agree to the{' '}
              <Link href="/policies/terms" className="underline hover:text-ink">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/policies/privacy" className="underline hover:text-ink">
                Privacy policy
              </Link>
            </>
          }
        />
        {errors.terms && <p className="mt-1 text-xs text-danger">{errors.terms}</p>}
      </div>

      <Button type="submit" size="lg" fullWidth loading={loading}>
        Create account
      </Button>
    </form>
  );
}
