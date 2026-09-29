'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || 'Unable to send password reset code. Please try again.';
        setError(errMsg);
        return;
      }

      // ইমেইলে ওটিপি পাঠানো সফল হলে সরাসরি ভেরিফাই পেজে নিয়ে যাওয়া হবে
      router.push(`/verify?type=reset&to=${encodeURIComponent(email)}`);
    } catch (err) {
      setError('Unable to connect to server. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

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
        Send verification code
      </Button>
    </form>
  );
}
