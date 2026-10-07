'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Clock,
  MessageSquare,
  Send,
  Sparkles,
  ShieldCheck,
  User,
  Hash,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { supportService } from '@/services/support-service';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TOPICS = [
  { id: 'Order enquiry', label: 'Order enquiry', icon: '📦' },
  { id: 'Returns & exchanges', label: 'Returns & exchanges', icon: '🔄' },
  { id: 'Payment issue', label: 'Payment issue', icon: '💳' },
  { id: 'Product question', label: 'Product question', icon: '🏷️' },
  { id: 'Wholesale', label: 'Wholesale inquiry', icon: '🤝' },
  { id: 'Other', label: 'Other questions', icon: '✨' },
];

export default function ContactPage() {
  const { tenant } = useTenant();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'Order enquiry',
    order: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    ticketId: string;
    email: string;
  } | null>(null);

  const phone = tenant.contact?.phone || '09612-826842';
  const email = tenant.contact?.email || 'care@tanti.com.bd';
  const whatsapp = tenant.contact?.whatsapp || '+880 1700-000000';
  const address =
    tenant.contact?.address ||
    'House 14, Road 27 (old), Dhanmondi, Dhaka 1209';
  const hours = tenant.contact?.workingHours || 'Sat–Thu, 10 AM – 9 PM';
  const supportTeam =
    tenant.contact?.supportTeam || `${tenant.name} Care team`;
  const responseTime =
    tenant.contact?.responseTime || 'replies within 2 to 4 working hours';

  const cleanWhatsappNumber = whatsapp
    ? whatsapp.replace(/[^0-9]/g, '')
    : '8801700000000';

  const directWhatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
    `Hello ${tenant.name}! I have an inquiry regarding: ${form.topic}${
      form.order ? ` (Order: ${form.order})` : ''
    }. ${form.message ? `\nMessage: ${form.message}` : ''}`
  )}`;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Please enter your name';
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = 'Please enter a valid email address';
    if (!form.message.trim() || form.message.trim().length < 5)
      errs.message = 'Please tell us a little more (at least 5 characters)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const res = await supportService.sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        topic: form.topic,
        orderNumber: form.order.trim() || undefined,
        message: form.message.trim(),
      });

      const ticketId = res.data?.ticketId || `TK-${Date.now().toString().slice(-6)}`;
      setSubmittedTicket({
        ticketId,
        email: form.email,
      });
      toast.success('Your message has been sent to our customer care team!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:px-8">
      {/* Left Column: Direct Info & Channels */}
      <div className="flex flex-col justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Customer Support
          </div>

          <h1 className="mt-4 font-display text-4xl sm:text-5xl text-ink font-normal leading-tight">
            Get in touch with us
          </h1>
          <p className="mt-3 max-w-md text-sm text-ink-soft leading-relaxed">
            Our {supportTeam} {responseTime}. For existing orders, including your order number helps us assist you faster.
          </p>

          <dl className="mt-8 space-y-5 text-sm">
            {/* Phone */}
            <div className="flex gap-4 rounded-xl border border-line bg-surface/60 p-4 transition-all hover:border-ink/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Customer hotline</dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  <a href={`tel:${phone}`} className="hover:underline">
                    {phone}
                  </a>
                </dd>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex gap-4 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 transition-all hover:border-emerald-500/40">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <dt className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                    WhatsApp Chat
                  </dt>
                  <span className="rounded-full bg-emerald-200/60 dark:bg-emerald-800/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-900 dark:text-emerald-100">
                    Instant
                  </span>
                </div>
                <dd className="mt-0.5 font-semibold text-emerald-900 dark:text-emerald-100">
                  <a
                    href={directWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    {whatsapp} <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </dd>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4 rounded-xl border border-line bg-surface/60 p-4 transition-all hover:border-ink/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Email inquiry</dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  <a href={`mailto:${email}`} className="hover:underline">
                    {email}
                  </a>
                </dd>
              </div>
            </div>

            {/* Address */}
            <div className="flex gap-4 rounded-xl border border-line bg-surface/60 p-4 transition-all hover:border-ink/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Flagship store & office</dt>
                <dd className="mt-0.5 font-medium text-ink leading-relaxed">
                  {address}
                </dd>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-4 rounded-xl border border-line bg-surface/60 p-4 transition-all hover:border-ink/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Operating hours</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {hours}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Security badge */}
        <div className="mt-8 flex items-center gap-2 text-xs text-ink-muted">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>All inquiries are encrypted and assigned a direct tracking ticket.</span>
        </div>
      </div>

      {/* Right Column: WhatsApp-Styled Live Messaging Form */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
        {/* WhatsApp-Inspired Chat Header Bar */}
        <div className="flex items-center justify-between bg-[#075E54] dark:bg-[#0c4039] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#128C7E] font-display text-lg font-semibold text-white shadow-inner">
                {tenant.name.slice(0, 1)}
              </div>
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#075E54] bg-[#25D366]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-semibold leading-tight text-white">
                  {tenant.name} Support
                </h2>
                <CheckCircle2 className="h-4 w-4 fill-emerald-400 text-[#075E54]" />
              </div>
              <p className="text-xs text-emerald-100/80">
                Online · Direct Messaging Desk
              </p>
            </div>
          </div>

          <a
            href={directWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] px-3.5 py-1.5 text-xs font-semibold text-white shadow transition-transform hover:scale-105"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            WhatsApp
          </a>
        </div>

        {/* WhatsApp Message Area */}
        <div className="bg-[#EFEAE2]/40 dark:bg-stone-900/40 p-6 sm:p-8">
          {submittedTicket ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <Check className="h-3.5 w-3.5" />
                <Check className="-ml-2 h-3.5 w-3.5" />
                Message Delivered
              </div>
              <h3 className="mt-2 text-xl font-bold text-ink">
                Thank you! We received your message
              </h3>
              <p className="mt-1 text-sm text-ink-muted">
                Reference ID:{' '}
                <span className="font-mono font-semibold text-clay">
                  #{submittedTicket.ticketId.slice(0, 8).toUpperCase()}
                </span>
              </p>
              <p className="mt-3 max-w-sm text-xs text-ink-soft leading-relaxed">
                Our support desk has received your ticket. A confirmation and response will be sent to <b>{submittedTicket.email}</b>.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSubmittedTicket(null);
                    setForm({
                      name: '',
                      email: '',
                      phone: '',
                      topic: 'Order enquiry',
                      order: '',
                      message: '',
                    });
                  }}
                  className="cursor-pointer"
                >
                  Send another inquiry
                </Button>
                <a
                  href={directWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-[#25D366] hover:bg-[#20bd5a] px-4 py-2 text-sm font-medium text-white shadow transition-colors"
                >
                  <MessageSquare className="h-4 w-4" /> Open in WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-5">
              {/* Topic Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                  Select Inquiry Topic
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {TOPICS.map((t) => {
                    const isSelected = form.topic === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setForm({ ...form, topic: t.id })}
                        className={cn(
                          'flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-medium transition-all cursor-pointer',
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-500'
                            : 'border-line bg-surface hover:border-ink/20 text-ink'
                        )}
                      >
                        <span className="text-base">{t.icon}</span>
                        <span className="truncate">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Inputs Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Your Name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  error={errors.name}
                  placeholder="e.g. Rahim Ahmed"
                />
                <Input
                  label="Your Email Address *"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  error={errors.email}
                  placeholder="rahim@example.com"
                />
                <Input
                  label="Phone / WhatsApp (Optional)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="017xxxxxxxx"
                />
                <Input
                  label="Order Number (Optional)"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                  placeholder="TN-10xxx"
                />
              </div>

              {/* WhatsApp Message Bubble Style Textarea */}
              <div className="relative rounded-xl border border-emerald-600/30 bg-surface p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-ink">
                    Type Your Message *
                  </label>
                  <span className="text-[11px] text-ink-muted">
                    {form.message.length} characters
                  </span>
                </div>
                <Textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  error={errors.message}
                  placeholder="Write your message here... (e.g. I would like to exchange my size or inquire about shipping time)"
                  className="bg-transparent border-0 focus:ring-0 p-0 resize-none text-sm placeholder:text-ink-muted"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <a
                  href={directWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  Chat on WhatsApp directly
                </a>

                <Button
                  type="submit"
                  size="lg"
                  loading={isSubmitting}
                  className="w-full sm:w-auto bg-[#075E54] hover:bg-[#128C7E] text-white font-medium px-6 py-2.5 cursor-pointer shadow-md"
                >
                  <Send className="h-4 w-4 mr-2" /> Send Message
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
