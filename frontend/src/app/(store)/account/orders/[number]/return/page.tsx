'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronLeftIcon, CameraIcon, XIcon, CheckIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { returnReasons } from '@/data/orders';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { formatBDT } from '@/utils/format';
import { paymentMethodLabel } from '@/utils/status';
import { cn } from '@/utils/cn';
import type { ReturnResolution } from '@/types/commerce';

const steps = ['Items', 'Reason', 'Resolution', 'Review'];

interface ReturnWizardPageProps {
  params: Promise<{ number: string }>;
}

export default function ReturnRequestWizardPage({ params }: ReturnWizardPageProps) {
  const { number } = use(params);
  const router = useRouter();
  const { orders, createReturn } = useStore();
  const order = orders.find((o) => o.number === number);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [reason, setReason] = useState(returnReasons[0]);
  const [details, setDetails] = useState('');
  const [photos, setPhotos] = useState<number>(0);
  const [resolution, setResolution] = useState<ReturnResolution>('refund');
  const [exchangeSize, setExchangeSize] = useState('L');
  const [error, setError] = useState('');

  if (!order) return <p className="text-sm">Order not found.</p>;
  const items = order.items.filter((i) => selected.includes(i.variantId));
  const amount = items.reduce((s, i) => s + i.price * i.qty, 0);
  const needsPhotos = reason === 'Damaged / defective' || reason === 'Wrong item received';
  const nonReturnable = (title: string) => /Saree|Jhumka/.test(title);

  const next = () => {
    setError('');
    if (step === 0 && selected.length === 0) {
      return setError('Select at least one item');
    }
    if (step === 1 && needsPhotos && photos === 0) {
      return setError('Please add at least one photo of the issue');
    }
    if (step === 3) {
      const r = createReturn({
        orderNumber: order.number,
        customerName: order.customerName,
        items: items.map((i) => ({
          title: i.title,
          image: i.image,
          qty: i.qty,
          price: i.price,
          size: i.size,
          color: i.color,
        })),
        reason,
        details:
          resolution === 'exchange'
            ? `${details} Exchange for size ${exchangeSize}.`.trim()
            : details,
        photos,
        resolution,
        amount,
      });
      toast.success(`Return ${r.id} submitted`);
      router.push('/account/returns');
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <div className="max-w-2xl">
      <Link
        href={`/account/orders/${order.number}`}
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeftIcon className="h-4 w-4" aria-hidden /> Order {order.number}
      </Link>
      <h1 className="mt-4 font-display text-3xl">Return or exchange</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Unworn items with tags can be returned within 7 days of delivery.{' '}
        <Link href="/policies/returns" className="underline">
          Policy
        </Link>
      </p>

      <ol className="mt-8 flex items-center gap-2" aria-label="Progress">
        {steps.map((s, i) => (
          <li
            key={s}
            className="flex flex-1 items-center gap-2"
            aria-current={i === step ? 'step' : undefined}
          >
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                i < step
                  ? 'bg-ink text-canvas'
                  : i === step
                  ? 'border-2 border-ink'
                  : 'border border-line-strong text-ink-muted'
              )}
            >
              {i < step ? <CheckIcon className="h-3.5 w-3.5" aria-hidden /> : i + 1}
            </span>
            <span
              className={cn(
                'hidden text-sm sm:inline',
                i === step ? 'font-medium' : 'text-ink-muted'
              )}
            >
              {s}
            </span>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-line" />}
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-lg border border-line bg-surface p-6">
        {step === 0 && (
          <fieldset>
            <legend className="text-sm font-semibold">Which items are you returning?</legend>
            <ul className="mt-4 space-y-3">
              {order.items.map((i) => {
                const blocked = nonReturnable(i.title);
                return (
                  <li
                    key={i.variantId}
                    className={cn(
                      'flex items-center gap-4 rounded-md border p-3',
                      selected.includes(i.variantId) ? 'border-ink' : 'border-line'
                    )}
                  >
                    <Checkbox
                      checked={selected.includes(i.variantId)}
                      disabled={blocked}
                      onChange={(v) =>
                        setSelected((s) =>
                          v ? [...s, i.variantId] : s.filter((x) => x !== i.variantId)
                        )
                      }
                      ariaLabel={`Select ${i.title}`}
                    />
                    <img
                      src={i.image}
                      alt=""
                      className="h-16 w-12 rounded object-cover"
                    />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{i.title}</p>
                      <p className="text-xs text-ink-muted">
                        {i.color} · {i.size} · {formatBDT(i.price)}
                      </p>
                      {blocked && (
                        <p className="mt-0.5 text-xs text-warning">
                          Returnable only if damaged — contact support
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <Select
              label="Reason for return"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              options={returnReasons}
            />
            <Textarea
              label="Tell us more (optional)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. The shoulders were tight"
            />
            <div>
              <p className="text-sm font-medium">
                Photos{' '}
                {needsPhotos ? (
                  <span className="text-danger">(required)</span>
                ) : (
                  <span className="font-normal text-ink-muted">(optional)</span>
                )}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.from({ length: photos }).map((_, i) => (
                  <div
                    key={i}
                    className="relative flex h-20 w-20 items-center justify-center rounded-md bg-subtle text-xs text-ink-muted"
                  >
                    IMG_{2040 + i}
                    <button
                      type="button"
                      onClick={() => setPhotos((p) => p - 1)}
                      className="absolute -right-1.5 -top-1.5 rounded-full bg-ink p-0.5 text-canvas cursor-pointer"
                      aria-label="Remove photo"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {photos < 4 && (
                  <button
                    type="button"
                    onClick={() => setPhotos((p) => p + 1)}
                    className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-line-strong text-xs text-ink-muted hover:border-ink hover:text-ink cursor-pointer"
                  >
                    <CameraIcon className="h-5 w-5" aria-hidden /> Add
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="text-sm font-semibold">
              How would you like us to resolve this?
            </legend>
            <div className="mt-4 space-y-2" role="radiogroup">
              {(
                [
                  [
                    'refund',
                    'Refund to original payment',
                    `${paymentMethodLabel[order.paymentMethod]} · 3–7 days after we receive the item`,
                  ],
                  [
                    'store_credit',
                    'Store credit',
                    'Instant once received · +5% bonus credit',
                  ],
                  [
                    'exchange',
                    'Exchange for another size',
                    'Courier swaps it at your door — free inside Dhaka',
                  ],
                ] as [ReturnResolution, string, string][]
              ).map(([v, t, d]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={resolution === v}
                  onClick={() => setResolution(v)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-md border p-4 text-left cursor-pointer transition-colors',
                    resolution === v ? 'border-ink ring-1 ring-ink' : 'border-line-strong hover:border-ink/50'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                      resolution === v ? 'border-ink' : 'border-line-strong'
                    )}
                  >
                    {resolution === v && (
                      <span className="h-2 w-2 rounded-full bg-ink" />
                    )}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{t}</span>
                    <span className="block text-xs text-ink-muted">{d}</span>
                  </span>
                </button>
              ))}
            </div>
            {resolution === 'exchange' && (
              <Select
                className="mt-4 max-w-[200px]"
                label="New size"
                value={exchangeSize}
                onChange={(e) => setExchangeSize(e.target.value)}
                options={['S', 'M', 'L', 'XL', 'XXL']}
              />
            )}
          </fieldset>
        )}

        {step === 3 && (
          <div className="space-y-4 text-sm">
            <h2 className="font-semibold">Review your request</h2>
            <ul className="space-y-2">
              {items.map((i) => (
                <li key={i.variantId} className="flex justify-between">
                  <span>
                    {i.title} ({i.size}) × {i.qty}
                  </span>
                  <span>{formatBDT(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="grid grid-cols-[120px_1fr] gap-y-2 border-t border-line pt-4">
              <dt className="text-ink-muted">Reason</dt>
              <dd>{reason}</dd>
              <dt className="text-ink-muted">Photos</dt>
              <dd>{photos}</dd>
              <dt className="text-ink-muted">Resolution</dt>
              <dd>
                {resolution === 'refund'
                  ? `Refund to ${paymentMethodLabel[order.paymentMethod]}`
                  : resolution === 'store_credit'
                  ? 'Store credit'
                  : `Exchange for size ${exchangeSize}`}
              </dd>
              <dt className="text-ink-muted">Pickup from</dt>
              <dd>
                {order.shippingAddress.line1}, {order.shippingAddress.area}
              </dd>
            </dl>
            {resolution !== 'exchange' && (
              <p className="rounded-md bg-subtle p-3">
                Estimated refund:{' '}
                <b>
                  {formatBDT(
                    resolution === 'store_credit' ? Math.round(amount * 1.05) : amount
                  )}
                </b>
                . Delivery fees are non-refundable unless the item was faulty.
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <div className="mt-8 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? router.back() : setStep((s) => s - 1))}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button onClick={next}>
            {step === 3 ? 'Submit request' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
