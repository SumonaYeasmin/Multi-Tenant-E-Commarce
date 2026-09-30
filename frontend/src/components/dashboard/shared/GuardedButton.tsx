'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import type { AdminModule, PermissionAction } from '@/types/commerce';

type ButtonProps = React.ComponentProps<typeof Button>;

export function GuardedButton({
  module,
  action,
  children,
  ...rest
}: ButtonProps & { module: AdminModule; action: PermissionAction }) {
  const { can, readOnly } = useAdmin();
  const allowed = can(module, action);

  if (allowed) return <Button {...rest}>{children}</Button>;

  return (
    <Button
      {...rest}
      to={undefined}
      onClick={undefined}
      disabled
      title={
        readOnly
          ? 'Store is read-only while the subscription is suspended'
          : `Requires ${module}: ${action} permission`
      }
    >
      <Lock className="h-3.5 w-3.5" aria-hidden />
      {children}
    </Button>
  );
}
