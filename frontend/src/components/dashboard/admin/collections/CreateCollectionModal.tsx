'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import type { CollectionItem, CollectionType } from '@/types/collection';

const typeOptions: [CollectionType, string, string][] = [
  ['rule', 'Automated', 'Products matching rules are added automatically'],
  ['manual', 'Manual', 'Choose products one by one'],
];

interface CreateCollectionModalProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onCreateCollection?: (newCollection: CollectionItem) => void;
}

export function CreateCollectionModal({
  open,
  onClose,
  products,
  onCreateCollection,
}: CreateCollectionModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CollectionType>('rule');
  const [rule, setRule] = useState({ field: 'Tag', op: 'contains', value: 'eid' });

  const matches = products.filter((p) => {
    const v = rule.value.toLowerCase().trim();
    if (!v) return false;
    if (rule.field === 'Tag') {
      return p.tags?.some((t) => t.toLowerCase().includes(v));
    }
    if (rule.field === 'Price') {
      const num = Number(rule.value);
      if (isNaN(num)) return false;
      return (p.salePrice ?? p.price) < num;
    }
    return p.title.toLowerCase().includes(v);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a collection title');
      return;
    }

    const newCol: CollectionItem = {
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name: title,
      description: type === 'rule' ? `Automated collection based on ${rule.field} ${rule.op} ${rule.value}` : 'Manual collection',
      image: matches[0]?.images[0] || 'https://raw.githubusercontent.com/masud2005/fashion-shop/HEAD/public/f5e95f4f-32c3-45ee-a648-f31f3ee1acb2.jpg',
      type,
      rule: type === 'rule' ? `${rule.field} ${rule.op} "${rule.value}"` : undefined,
    };

    onCreateCollection?.(newCol);
    toast.success(`Collection "${title}" created successfully`);
    setTitle('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Create collection"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button onClick={handleSubmit} type="button">
            Create collection
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Title"
          placeholder="e.g. Puja Edit 2026"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Collection type">
          {typeOptions.map(([v, t, d]) => {
            const isChecked = type === v;
            return (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={isChecked}
                onClick={() => setType(v)}
                className={cn(
                  'rounded-md border p-3 text-left transition-all cursor-pointer',
                  isChecked
                    ? 'border-ink ring-1 ring-ink bg-canvas/30'
                    : 'border-line-strong hover:bg-subtle/50'
                )}
              >
                <span className="block text-sm font-medium text-ink">{t}</span>
                <span className="block text-xs text-ink-muted mt-0.5">{d}</span>
              </button>
            );
          })}
        </div>

        {type === 'rule' && (
          <div className="rounded-lg border border-line bg-canvas/20 p-4">
            <p className="text-sm font-medium text-ink">Conditions</p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Select
                aria-label="Field"
                value={rule.field}
                onChange={(e) => setRule({ ...rule, field: e.target.value })}
                options={['Tag', 'Title', 'Price']}
              />
              <Select
                aria-label="Operator"
                value={rule.op}
                onChange={(e) => setRule({ ...rule, op: e.target.value })}
                options={rule.field === 'Price' ? ['is less than'] : ['contains', 'equals']}
              />
              <Input
                aria-label="Value"
                value={rule.value}
                onChange={(e) => setRule({ ...rule, value: e.target.value })}
                placeholder="Value..."
              />
            </div>

            <p className="mt-3 text-sm text-ink-muted">
              <span className="font-semibold text-ink">{matches.length}</span> products currently match
            </p>

            {matches.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-2 pt-1">
                {matches.slice(0, 8).map((p) => (
                  <div
                    key={p.id}
                    className="relative h-14 w-11 overflow-hidden rounded border border-line bg-subtle"
                    title={p.title}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
