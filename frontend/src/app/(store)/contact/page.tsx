'use client';

import React, { useState } from 'react';
import {
  CheckCircle2Icon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  MessageSquareIcon,
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const { tenant } = useTenant();
  const [form, setForm] = useState({
    name: '',
    email: '',
    topic: 'Order enquiry',
    order: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!form.name.trim()) er.name = 'Enter your name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email';
    if (form.message.trim().length < 10) er.message = 'Tell us a little more';
    setErrors(er);
    if (Object.keys(er).length) return;
    setStatus('sending');
    await new Promise((r) => setTimeout(r, 700));
    setStatus('sent');
  };

  const supportTeam =
    tenant.contact?.supportTeam || `${tenant.name} Care team`;
  const responseTime =
    tenant.contact?.responseTime || 'replies within 2 to 4 working hours';
  const phone = tenant.contact?.phone || '09612-826842';
  const email = tenant.contact?.email || 'care@tanti.com.bd';
  const whatsapp = tenant.contact?.whatsapp;
  const address =
    tenant.contact?.address ||
    'House 14, Road 27 (old), Dhanmondi, Dhaka 1209';
  const hours = tenant.contact?.workingHours || 'Sat–Thu, 10 AM – 9 PM';

  const cleanWhatsappNumber = whatsapp
    ? whatsapp.replace(/[^0-9]/g, '')
    : '';

  return (
    <div className="mx-auto grid max-w-7xl gap-16 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
      <div>
        <h1 className="font-display text-5xl text-ink">Get in touch</h1>
        <p className="mt-3 max-w-md text-ink-soft">
          Our {supportTeam} {responseTime}. For order issues, including your
          order number helps us help you faster.
        </p>

        <dl className="mt-10 space-y-6 text-sm">
          {/* Call / Phone */}
          <div className="flex gap-4">
            <PhoneIcon className="mt-0.5 h-5 w-5 text-ink-muted shrink-0" aria-hidden />
            <div>
              <dt className="text-ink-muted">Call</dt>
              <dd className="mt-0.5 font-medium text-ink">
                <a href={`tel:${phone}`} className="hover:underline">
                  {phone}
                </a>
              </dd>
            </div>
          </div>

          {/* WhatsApp if available */}
          {whatsapp && (
            <div className="flex gap-4">
              <MessageSquareIcon className="mt-0.5 h-5 w-5 text-success shrink-0" aria-hidden />
              <div>
                <dt className="text-ink-muted">WhatsApp</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  <a
                    href={`https://wa.me/${cleanWhatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-success"
                  >
                    {whatsapp}
                  </a>
                </dd>
              </div>
            </div>
          )}

          {/* Email */}
          <div className="flex gap-4">
            <MailIcon className="mt-0.5 h-5 w-5 text-ink-muted shrink-0" aria-hidden />
            <div>
              <dt className="text-ink-muted">Email</dt>
              <dd className="mt-0.5 font-medium text-ink">
                <a href={`mailto:${email}`} className="hover:underline">
                  {email}
                </a>
              </dd>
            </div>
          </div>

          {/* Store Address */}
          <div className="flex gap-4">
            <MapPinIcon className="mt-0.5 h-5 w-5 text-ink-muted shrink-0" aria-hidden />
            <div>
              <dt className="text-ink-muted">Flagship store</dt>
              <dd className="mt-0.5 font-medium text-ink leading-relaxed">
                {address}
              </dd>
            </div>
          </div>

          {/* Working Hours */}
          <div className="flex gap-4">
            <ClockIcon className="mt-0.5 h-5 w-5 text-ink-muted shrink-0" aria-hidden />
            <div>
              <dt className="text-ink-muted">Hours</dt>
              <dd className="mt-0.5 font-medium text-ink">
                {hours}
              </dd>
            </div>
          </div>
        </dl>
      </div>

      {/* Right Contact Form */}
      <div className="rounded-lg border border-line bg-surface p-6 sm:p-8">
        {status === 'sent' ? (
          <div className="flex flex-col items-center py-12 text-center" role="status">
            <CheckCircle2Icon className="h-10 w-10 text-success" aria-hidden />
            <h2 className="mt-4 text-lg font-semibold text-ink">Message received</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Ticket T-2042 created. We’ll reply to {form.email} shortly.
            </p>
            <Button
              variant="secondary"
              className="mt-6"
              onClick={() => {
                setStatus('idle');
                setForm({ ...form, message: '' });
              }}
            >
              Send another
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />
            <Select
              label="Topic"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              options={[
                'Order enquiry',
                'Returns & exchanges',
                'Payment issue',
                'Product question',
                'Wholesale',
                'Other',
              ]}
            />
            <Input
              label="Order number (optional)"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
              placeholder="TN-10xxx"
            />
            <Textarea
              label="Message"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              error={errors.message}
              className="sm:col-span-2"
            />
            <div className="sm:col-span-2">
              <Button type="submit" size="lg" loading={status === 'sending'}>
                Send message
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
