import React from 'react';
import { LockIcon } from 'lucide-react';
import { paymentMethods } from '@/data/shipping';
import { PaymentMark } from '@/components/ui/PaymentMark';
import type { PaymentMethod } from '@/types/commerce';
import { Section } from './Section';
import { RadioCard } from './RadioCard';

interface PaymentSectionProps {
  payment: PaymentMethod;
  onSelectPayment: (method: PaymentMethod) => void;
}

export function PaymentSection({
  payment,
  onSelectPayment,
}: PaymentSectionProps) {
  const currentMethod = paymentMethods.find((p) => p.id === payment);

  return (
    <Section step={3} title="Payment">
      <div className="space-y-2" role="radiogroup" aria-label="Payment method">
        {paymentMethods.map((p) => (
          <RadioCard
            key={p.id}
            checked={payment === p.id}
            onSelect={() => onSelectPayment(p.id)}
            row
          >
            <PaymentMark method={p.id} className="h-7 min-w-[2.5rem]" />
            <div className="flex-1">
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-sm text-ink-muted">{p.description}</p>
            </div>
          </RadioCard>
        ))}
      </div>
      {payment !== 'cod' && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
          <LockIcon className="h-3 w-3" aria-hidden /> You’ll be redirected to{' '}
          {currentMethod?.name} to complete payment securely. We never see your PIN or card number.
        </p>
      )}
    </Section>
  );
}
