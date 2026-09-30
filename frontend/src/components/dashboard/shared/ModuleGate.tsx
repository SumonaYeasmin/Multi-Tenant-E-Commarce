'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { roleMeta } from '@/data/admin';
import { Button } from '@/components/ui/button';
import type { AdminModule, PermissionAction } from '@/types/commerce';

export function ModuleGate({
  module,
  action = 'view',
  children
}: {
  module: AdminModule;
  action?: PermissionAction;
  children: React.ReactNode;
}) {
  const { can, role } = useAdmin();
  if (can(module, action)) return <>{children}</>;

  const meta = roleMeta[role] ?? roleMeta.owner;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-subtle">
        <ShieldAlert className="h-5 w-5 text-ink-soft" aria-hidden />
      </span>
      <h1 className="mt-4 text-lg font-semibold text-ink">You don’t have access to this page</h1>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">
        Your role (<b>{meta.name}</b>) doesn’t include the <b>{module}: {action}</b> permission. Ask the store owner to update your role.
      </p>
      <Button className="mt-6" variant="secondary" to="/admin">
        Back to dashboard
      </Button>
    </div>
  );
}
