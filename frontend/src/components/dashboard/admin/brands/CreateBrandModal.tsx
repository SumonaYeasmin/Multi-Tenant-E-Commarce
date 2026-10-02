'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/button';
import { brandService } from '@/services/brand-service';
import type { BrandItem } from './BrandRow';

interface CreateBrandModalProps {
  open: boolean;
  onClose: () => void;
  onCreateBrand: (newBrand: BrandItem) => void;
}

export function CreateBrandModal({
  open,
  onClose,
  onCreateBrand,
}: CreateBrandModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter a brand name');
      return;
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    setIsSubmitting(true);

    try {
      // 1. Call backend API to create brand in PostgreSQL DB
      await brandService.createBrand({
        name: name.trim(),
        slug: slug || undefined,
        description: description.trim() || undefined,
        logo: logo.trim() || undefined,
        isActive: true,
        tenantId: 'e0f8bdb1-da0a-4907-9d82-08ef1be77ac2',
      });

      const newBrandItem: BrandItem = {
        name: name.trim(),
        slug,
        description: description.trim() || 'Curated partner brand on Tanti.',
        logo: logo.trim() || null,
        isActive: true,
      };

      onCreateBrand(newBrandItem);
      setName('');
      setDescription('');
      setLogo('');
      onClose();
      toast.success(`Brand "${name.trim()}" created successfully!`);
    } catch (error: any) {
      console.error('Failed to create brand:', error);
      toast.error(error?.message || 'Failed to create brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add new brand"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            Create brand
          </Button>
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
        <Input
          label="Logo URL (optional)"
          placeholder="https://example.com/logo.png"
          value={logo}
          onChange={(e) => setLogo(e.target.value)}
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
  );
}
