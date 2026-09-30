'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeftIcon, LifeBuoyIcon, PlusIcon, SendIcon } from 'lucide-react';
import { supportTickets } from '@/data/customers';
import { useStore } from '@/contexts/StoreContext';
import { AccountHeader } from '@/components/account/AccountHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime, timeAgo } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { SupportTicket } from '@/types/commerce';

const statusTone = {
  open: 'info',
  awaiting: 'warning',
  resolved: 'success',
} as const;

const statusLabel = {
  open: 'Open',
  awaiting: 'Awaiting your reply',
  resolved: 'Resolved',
};

export default function AccountSupportPage() {
  const { user, orders } = useStore();
  const [tickets, setTickets] = useState<SupportTicket[]>(supportTickets);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ subject: '', order: '', message: '' });
  const active = tickets.find((t) => t.id === activeId);
  const myOrders = orders.filter((o) => o.customerId === user?.id);

  const send = () => {
    if (!reply.trim() || !active) return;
    setTickets((ts) =>
      ts.map((t) =>
        t.id === active.id
          ? {
              ...t,
              status: 'open',
              updatedAt: new Date().toISOString(),
              messages: [
                ...t.messages,
                {
                  from: 'customer',
                  name: user?.name ?? 'You',
                  text: reply,
                  at: new Date().toISOString(),
                },
              ],
            }
          : t
      )
    );
    setReply('');
  };

  const create = () => {
    if (draft.subject.trim().length < 4 || draft.message.trim().length < 10) {
      return toast.error('Add a subject and describe the issue');
    }
    const t: SupportTicket = {
      id: `T-${2042 + tickets.length}`,
      subject: draft.subject,
      orderNumber: draft.order || undefined,
      status: 'open',
      updatedAt: new Date().toISOString(),
      messages: [
        {
          from: 'customer',
          name: user?.name ?? 'You',
          text: draft.message,
          at: new Date().toISOString(),
        },
      ],
    };
    setTickets([t, ...tickets]);
    setCreating(false);
    setDraft({ subject: '', order: '', message: '' });
    setActiveId(t.id);
    toast.success('Request sent — we usually reply within 4 hours');
  };

  if (active) {
    return (
      <div className="max-w-3xl">
        <button
          onClick={() => setActiveId(null)}
          className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink cursor-pointer"
        >
          <ChevronLeftIcon className="h-4 w-4" aria-hidden /> All requests
        </button>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl">{active.subject}</h1>
            <p className="text-sm text-ink-muted">
              {active.id}
              {active.orderNumber && ` · Order ${active.orderNumber}`}
            </p>
          </div>
          <Badge tone={statusTone[active.status]}>{statusLabel[active.status]}</Badge>
        </div>
        <ol className="mt-6 space-y-4">
          {active.messages.map((m, i) => (
            <li
              key={i}
              className={cn(
                'max-w-[85%] rounded-lg p-4 text-sm',
                m.from === 'customer'
                  ? 'ml-auto bg-ink text-canvas'
                  : 'border border-line bg-surface'
              )}
            >
              <p
                className={cn(
                  'text-xs',
                  m.from === 'customer' ? 'text-canvas/70' : 'text-ink-muted'
                )}
              >
                {m.name} · {formatDateTime(m.at)}
              </p>
              <p className="mt-1.5 leading-relaxed">{m.text}</p>
            </li>
          ))}
        </ol>
        {active.status !== 'resolved' ? (
          <div className="mt-6 flex gap-2">
            <label htmlFor="reply" className="sr-only">
              Reply
            </label>
            <textarea
              id="reply"
              rows={2}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a reply…"
              className="flex-1 rounded-md border border-line-strong bg-surface px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
            <Button
              onClick={send}
              disabled={!reply.trim()}
              aria-label="Send reply"
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink-muted">
            This request is resolved.{' '}
            <button
              onClick={() =>
                setTickets((ts) =>
                  ts.map((t) => (t.id === active.id ? { ...t, status: 'open' } : t))
                )
              }
              className="underline cursor-pointer"
            >
              Reopen
            </button>
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <AccountHeader
        title="Support"
        description="Questions about an order, payment or return? We’re here."
        action={
          <Button size="sm" onClick={() => setCreating(true)}>
            <PlusIcon className="h-4 w-4" aria-hidden /> New request
          </Button>
        }
      />
      {tickets.length === 0 ? (
        <EmptyState icon={LifeBuoyIcon} title="No support requests" />
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
          {tickets.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => setActiveId(t.id)}
                className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-left hover:bg-canvas cursor-pointer transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.subject}</p>
                  <p className="text-xs text-ink-muted">
                    {t.id}
                    {t.orderNumber && ` · ${t.orderNumber}`} · updated {timeAgo(t.updatedAt)}
                  </p>
                </div>
                <Badge tone={statusTone[t.status]}>{statusLabel[t.status]}</Badge>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New support request"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button onClick={create}>Send request</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Subject"
            value={draft.subject}
            onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
          />
          <Select
            label="Related order (optional)"
            value={draft.order}
            onChange={(e) => setDraft({ ...draft, order: e.target.value })}
            options={[
              { value: '', label: 'None' },
              ...myOrders.map((o) => ({ value: o.number, label: o.number })),
            ]}
          />
          <Textarea
            label="How can we help?"
            value={draft.message}
            onChange={(e) => setDraft({ ...draft, message: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
