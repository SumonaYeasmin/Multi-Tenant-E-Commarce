'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { MapPinIcon, PlusIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { areasFor, districts } from '@/data/shipping';
import { AccountHeader } from '@/components/account/AccountHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Address } from '@/types/commerce';

const blank: Address = {
  id: '',
  label: 'Home',
  name: '',
  phone: '',
  line1: '',
  area: 'Dhanmondi',
  district: 'Dhaka',
};

export default function AccountAddressesPage() {
  const { addresses, saveAddress, deleteAddress, setDefaultAddress } = useStore();
  const [editing, setEditing] = useState<Address | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<Address | null>(null);

  const save = async () => {
    if (!editing) return;
    const er: Record<string, string> = {};
    if (!editing.name.trim()) er.name = 'Required';
    if (!/^01[3-9]\d{2}-?\d{6}$|^01[3-9]\d{8}$/.test(editing.phone.replace(/\s/g, '')))
      er.phone = 'Enter an 11-digit mobile number';
    if (editing.line1.trim().length < 5) er.line1 = 'Enter house, road and area';
    setErrors(er);
    if (Object.keys(er).length) return;
    await saveAddress({ ...editing, id: editing.id || `a${Date.now()}` });
    setEditing(null);
    toast.success('Address saved');
  };

  return (
    <div>
      <AccountHeader
        title="Addresses"
        description="Saved addresses make checkout faster."
        action={
          <Button
            size="sm"
            onClick={() => {
              setErrors({});
              setEditing(blank);
            }}
          >
            <PlusIcon className="h-4 w-4" aria-hidden /> Add address
          </Button>
        }
      />
      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPinIcon}
          title="No saved addresses"
          action={<Button onClick={() => setEditing(blank)}>Add your first address</Button>}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li
              key={a.id}
              className="flex flex-col rounded-lg border border-line bg-surface p-5"
            >
              <div className="flex items-center gap-2">
                <p className="font-medium">{a.label}</p>
                {a.isDefaultShipping && <Badge tone="clay">Default shipping</Badge>}
                {a.isDefaultBilling && <Badge>Billing</Badge>}
              </div>
              <p className="mt-2 text-sm">
                {a.name} · {a.phone}
              </p>
              <p className="text-sm text-ink-muted">
                {a.line1}, {a.area}, {a.district}
              </p>
              <div className="mt-auto flex gap-4 pt-4 text-sm">
                <button
                  onClick={() => {
                    setErrors({});
                    setEditing(a);
                  }}
                  className="font-medium underline-offset-2 hover:underline cursor-pointer"
                >
                  Edit
                </button>
                {!a.isDefaultShipping && (
                  <button
                    onClick={() => setDefaultAddress(a.id)}
                    className="text-ink-soft hover:text-ink cursor-pointer"
                  >
                    Set as default
                  </button>
                )}
                <button
                  onClick={() => setConfirmDelete(a)}
                  className="ml-auto text-ink-muted hover:text-danger cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit address' : 'Add address'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save}>Save address</Button>
          </>
        }
      >
        {editing && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Label"
              value={editing.label}
              onChange={(e) => setEditing({ ...editing, label: e.target.value })}
              options={['Home', 'Office', "Parents' home", 'Other']}
              className="sm:col-span-2"
            />
            <Input
              label="Recipient name"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              error={errors.name}
            />
            <Input
              label="Phone"
              value={editing.phone}
              onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
              error={errors.phone}
              placeholder="01XXX-XXXXXX"
            />
            <Input
              label="House, road, area"
              value={editing.line1}
              onChange={(e) => setEditing({ ...editing, line1: e.target.value })}
              error={errors.line1}
              className="sm:col-span-2"
            />
            <Select
              label="District"
              value={editing.district}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  district: e.target.value,
                  area: areasFor(e.target.value)[0],
                })
              }
              options={districts}
            />
            <Select
              label="Thana / area"
              value={editing.area}
              onChange={(e) => setEditing({ ...editing, area: e.target.value })}
              options={areasFor(editing.district)}
            />
            <Checkbox
              className="sm:col-span-2"
              checked={!!editing.isDefaultShipping}
              onChange={(v) => setEditing({ ...editing, isDefaultShipping: v })}
              label="Use as default delivery address"
            />
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete this address?"
        description={
          confirmDelete ? `${confirmDelete.label} — ${confirmDelete.line1}` : ''
        }
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirmDelete) deleteAddress(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      />
    </div>
  );
}
