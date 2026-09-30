'use client';

import React from 'react';
import Link from 'next/link';
import { ScaleIcon, XIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/contexts/StoreContext';
import { Modal } from '@/components/ui/Modal';
import { Rating } from '@/components/ui/Rating';
import { productPrice, productStock } from '@/utils/pricing';
import { formatBDT } from '@/utils/format';

export function CompareDrawer() {
  const { compare, products, toggleCompare, compareOpen, setCompareOpen } =
    useStore();
  const items = compare
    .map((id) => products.find((p) => p.id === id)!)
    .filter(Boolean);

  const rows: {
    label: string;
    render: (p: (typeof items)[number]) => React.ReactNode;
  }[] = [
    {
      label: 'Price',
      render: (p) => (
        <span className="font-semibold text-ink">
          {formatBDT(productPrice(p))}
        </span>
      ),
    },
    {
      label: 'Rating',
      render: (p) => (
        <span className="flex items-center gap-1.5 text-ink">
          <Rating value={p.rating} /> {p.rating}
        </span>
      ),
    },
    { label: 'Brand', render: (p) => p.brand },
    { label: 'Category', render: (p) => p.subcategory || p.category },
    {
      label: 'Colours',
      render: (p) => p.colors.map((c) => c.name).join(', '),
    },
    { label: 'Sizes', render: (p) => p.sizes.join(', ') },
    {
      label: 'Material',
      render: (p) =>
        p.specs.find((s) => ['Fabric', 'Upper', 'Material'].includes(s.label))
          ?.value ?? '—',
    },
    {
      label: 'Availability',
      render: (p) =>
        productStock(p) > 0
          ? 'In stock'
          : p.preorder
          ? 'Pre-order'
          : 'Sold out',
    },
  ];

  return (
    <>
      <AnimatePresence>
        {items.length > 0 && !compareOpen && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => setCompareOpen(true)}
            className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-canvas shadow-pop cursor-pointer hover:bg-ink/90 transition-colors"
          >
            <ScaleIcon className="h-4 w-4" aria-hidden /> Compare (
            {items.length})
          </motion.button>
        )}
      </AnimatePresence>
      <Modal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        title="Compare products"
        description="Compare up to 4 pieces side by side."
        size="xl"
      >
        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-muted">
            Nothing to compare yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr>
                  <th className="w-28" />
                  {items.map((p) => (
                    <th
                      key={p.id}
                      className="px-3 pb-4 text-left align-top font-normal"
                    >
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.images[0]}
                          alt=""
                          className="aspect-[3/4] w-full rounded object-cover border border-line"
                        />
                        <button
                          onClick={() => toggleCompare(p.id)}
                          className="absolute right-1.5 top-1.5 rounded-full bg-surface p-1 cursor-pointer shadow-xs hover:bg-canvas"
                          aria-label={`Remove ${p.title}`}
                        >
                          <XIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <Link
                        href={`/products/${p.slug}`}
                        onClick={() => setCompareOpen(false)}
                        className="mt-2 block font-medium hover:underline text-ink"
                      >
                        {p.title}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-t border-line">
                    <th
                      scope="row"
                      className="py-3 pr-3 text-left text-xs font-medium text-ink-muted"
                    >
                      {r.label}
                    </th>
                    {items.map((p) => (
                      <td key={p.id} className="px-3 py-3 align-top text-ink">
                        {r.render(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </>
  );
}
