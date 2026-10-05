import React from 'react';
import { formatBDT } from '@/utils/format';
import { deliveryEstimate, type ShippingMethod } from '@/data/shipping';
import { Section } from './Section';
import { RadioCard } from './RadioCard';

interface DeliveryMethodSectionProps {
  methods: ShippingMethod[];
  selectedMethodId: string;
  onSelectMethod: (id: string) => void;
  district: string;
  subtotal: number;
  isFreeShipping?: boolean;
}

export function DeliveryMethodSection({
  methods,
  selectedMethodId,
  onSelectMethod,
  district,
  subtotal,
  isFreeShipping,
}: DeliveryMethodSectionProps) {
  return (
    <Section step={2} title="Delivery method">
      <div className="space-y-2" role="radiogroup" aria-label="Delivery method">
        {methods.map((m) => {
          const price = isFreeShipping ? 0 : m.price(district, subtotal);
          return (
            <RadioCard
              key={m.id}
              checked={selectedMethodId === m.id}
              onSelect={() => onSelectMethod(m.id)}
              row
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-sm text-ink-muted">
                  {m.description} · {deliveryEstimate(district, m.id)}
                </p>
              </div>
              <span className="text-sm font-medium tabular-nums">
                {price === 0 ? 'Free' : formatBDT(price)}
              </span>
            </RadioCard>
          );
        })}
      </div>
    </Section>
  );
}
