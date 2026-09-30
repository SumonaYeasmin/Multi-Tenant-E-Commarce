'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { brands as initialBrands } from '@/data/products';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Panel } from '@/components/dashboard/shared/Panel';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/button';
import { formatBDT } from '@/utils/format';

export default function AdminBrandsPage() {
  const { products } = useStore();
  const [brandList, setBrandList] = useState(initialBrands);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateBrand = () => {
    if (!name.trim()) {
      toast.error('Please enter a brand name');
      return;
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setBrandList((prev) => [
      ...prev,
      {
        slug,
        name: name.trim(),
        description: description.trim() || 'Curated partner brand on Tanti.',
        logo: '',
      },
    ]);
    setName('');
    setDescription('');
    setModalOpen(false);
    toast.success(`Brand "${name.trim()}" created successfully`);
  };

  return (
    <ModuleGate module="products">
      <div className="w-full space-y-6">
        <PageHeader
          title="Brands"
          description="Each brand gets its own storefront page and filter."
          actions={
            <GuardedButton
              module="products"
              action="create"
              size="sm"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="h-4 w-4" aria-hidden /> Add brand
            </GuardedButton>
          }
        />
        <Panel flush>
          <ul className="divide-y divide-line">
            {brandList.map((b) => {
              const list = products.filter((p) => p.brand === b.name);
              const revenue = list.reduce(
                (s, p) => s + p.sold * (p.salePrice ?? p.price),
                0
              );
              return (
                <li
                  key={b.slug}
                  className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-subtle/50"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-subtle font-display text-lg font-bold text-ink">
                    {b.name[0]}
                  </span>
                  <div className="min-w-[200px] flex-1">
                    <p className="text-sm font-medium text-ink">{b.name}</p>
                    <p className="text-sm text-ink-muted">{b.description}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="tabular-nums font-medium text-ink">{list.length} products</p>
                    <p className="text-xs text-ink-muted tabular-nums">
                      {formatBDT(revenue)} · 30d
                    </p>
                  </div>
                  <Link
                    href={`/brands/${b.slug}`}
                    className="text-sm font-medium text-clay hover:underline"
                  >
                    Brand page
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Add new brand"
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBrand}>Create brand</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Brand name"
              placeholder="e.g. Jamdani Heritage"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <Textarea
              label="Description"
              placeholder="Brief description for storefront and SEO..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </Modal>
      </div>
    </ModuleGate>
  );
}
