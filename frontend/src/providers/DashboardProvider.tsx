'use client';

import React from 'react';
import { StoreProvider } from '@/contexts/StoreContext';
import { AdminProvider } from '@/contexts/AdminContext';
import type { AdminRole, PlanState } from '@/types/commerce';

interface DashboardProviderProps {
  children: React.ReactNode;
  role?: AdminRole;
  planState?: PlanState;
}

export function DashboardProvider({
  children,
  role = 'owner',
  planState = 'active'
}: DashboardProviderProps) {
  return (
    <StoreProvider>
      <AdminProvider role={role} planState={planState}>
        {children}
      </AdminProvider>
    </StoreProvider>
  );
}
