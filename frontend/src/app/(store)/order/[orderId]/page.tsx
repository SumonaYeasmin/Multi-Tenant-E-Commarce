'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  PackageIcon,
} from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { paymentMethods } from '@/data/shipping';
import { Button } from '@/components/ui/button';
import { PaymentMark } from '@/components/ui/PaymentMark';
import { formatBDT } from '@/utils/format';
import { paymentMethodLabel } from '@/utils/status';
import { cn } from '@/utils/cn';
import type { PaymentMethod } from '@/types/commerce';

interface OrderConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderId } = use(params);
  const router = useRouter();
  const { orders, retryPayment, user } = useStore();
  const order = orders.find((o) => o.id === orderId);
  const [method, setMethod] = useState<PaymentMethod | null>(null);

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-lg font-medium text-ink">Order not found</p>
        <Link href="/" className="mt-4 inline-block text-sm text-clay underline">
          Return to home
        </Link>
      </div>
    );
  }

  const awaitingPayment = order.status === 'pending_payment';
  const failed =
    awaitingPayment &&
    (order.paymentStatus === 'failed' ||
      order.attempts.some((a) => a.status === 'cancelled' || a.status === 'failed'));
  const chosen = method ?? order.paymentMethod;

  const retry = () => {
    retryPayment(order.id, chosen);
    if (chosen === 'cod') return;
    router.push(`/pay/${order.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {awaitingPayment ? (
        <div className="rounded-lg border border-line bg-surface p-6 sm:p-8" role="alert">
          <div className="flex items-start gap-4">
            {failed ? (
              <XCircleIcon className="h-8 w-8 shrink-0 text-danger" aria-hidden />
            ) : (
              <ClockIcon className="h-8 w-8 shrink-0 text-warning" aria-hidden />
            )}
            <div>
              <h1 className="font-display text-3xl">
                {failed ? 'Payment didn’t go through' : 'Awaiting payment'}
              </h1>
              <p className="mt-2 text-sm text-ink-soft">
                Your order <b>{order.number}</b> is saved and the items are reserved for 30
                minutes.{' '}
                {failed &&
                  'No money was taken — if your account was charged, it will be refunded automatically within 5–7 days.'}
              </p>
            </div>
          </div>
          <div
            className="mt-6 space-y-2"
            role="radiogroup"
            aria-label="Choose a payment method"
          >
            {paymentMethods.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={chosen === p.id}
                onClick={() => setMethod(p.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md border p-3 text-left cursor-pointer transition-colors',
                  chosen === p.id ? 'border-ink ring-1 ring-ink' : 'border-line-strong hover:border-ink/50'
                )}
              >
                <PaymentMark method={p.id} />
                <span className="text-sm font-medium">{p.name}</span>
                {p.id === order.paymentMethod && (
                  <span className="ml-auto text-xs text-ink-muted">Previous attempt</span>
                )}
              </button>
            ))}
          </div>
          <Button size="lg" fullWidth className="mt-5" onClick={retry}>
            {chosen === 'cod'
              ? 'Switch to cash on delivery'
              : `Try again with ${paymentMethodLabel[chosen]} · ${formatBDT(order.total)}`}
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <CheckCircle2Icon className="mx-auto h-12 w-12 text-success" aria-hidden />
          <h1 className="mt-4 font-display text-4xl">
            Thank you, {order.customerName.split(' ')[0]}
          </h1>
          <p className="mt-2 text-ink-soft">
            Order <b>{order.number}</b> is confirmed.{' '}
            {order.email
              ? `We’ve sent a confirmation to ${order.email} and an SMS to ${order.phone}.`
              : `We’ve sent an SMS confirmation to ${order.phone}.`}
          </p>
        </div>
      )}

      <div className="mt-10 rounded-lg border border-line bg-surface">
        <div className="grid gap-6 border-b border-line p-6 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-ink-muted">Deliver to</p>
            <p className="mt-1 font-medium">{order.shippingAddress.name}</p>
            <p className="text-ink-soft">
              {order.shippingAddress.line1}, {order.shippingAddress.area},{' '}
              {order.shippingAddress.district}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Delivery</p>
            <p className="mt-1 font-medium">{order.shippingMethod}</p>
            <p className="text-ink-soft">
              {order.shippingMethod?.toLowerCase().includes('pickup')
                ? 'Ready today'
                : order.shippingAddress.district === 'Dhaka'
                ? 'Arrives in 1–2 days'
                : 'Arrives in 3–5 days'}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Payment</p>
            <p className="mt-1 flex items-center gap-2 font-medium">
              <PaymentMark method={order.paymentMethod} />{' '}
              {paymentMethodLabel[order.paymentMethod]}
            </p>
            <p className="text-ink-soft">
              {order.paymentStatus === 'paid'
                ? 'Paid'
                : order.paymentMethod === 'cod'
                ? `Pay ${formatBDT(order.total)} on delivery`
                : 'Not paid yet'}
            </p>
          </div>
        </div>
        <ul className="divide-y divide-line px-6">
          {order.items.map((i) => (
            <li key={i.variantId} className="flex items-center gap-4 py-4">
              <img src={i.image} alt="" className="h-16 w-12 rounded object-cover" />
              <div className="flex-1 text-sm">
                <p className="font-medium">{i.title}</p>
                <p className="text-xs text-ink-muted">
                  {i.color} · {i.size} · Qty {i.qty}
                </p>
              </div>
              <span className="text-sm tabular-nums">{formatBDT(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-1.5 border-t border-line p-6 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Subtotal</dt>
            <dd>{formatBDT(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-success">
              <dt>Discount</dt>
              <dd>−{formatBDT(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-ink-muted">Delivery & fees</dt>
            <dd>{order.shipping === 0 ? 'Free' : formatBDT(order.shipping)}</dd>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatBDT(order.total)}</dd>
          </div>
        </dl>
      </div>

      {!awaitingPayment && (
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {user ? (
            <Button href={`/account/orders/${order.number}`}>
              <PackageIcon className="h-4 w-4" aria-hidden /> Track this order
            </Button>
          ) : (
            <Button href="/register">Create an account to track orders</Button>
          )}
          <Button variant="secondary" href="/shop">
            Continue shopping
          </Button>
        </div>
      )}
      <p className="mt-6 text-center text-xs text-ink-muted">
        Need help?{' '}
        <Link href="/contact" className="underline">
          Contact Tanti Care
        </Link>{' '}
        · 09612-826842
      </p>
    </div>
  );
}
