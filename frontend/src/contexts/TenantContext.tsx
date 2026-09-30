'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Tenant, TenantModules } from '@/types/tenant';
import { getTenantBySlug, mockTenants, DEFAULT_TENANT_SLUG } from '@/data/tenants';

export interface TenantContextValue {
  tenant: Tenant;
  isSuspended: boolean;
  formatPrice: (amount: number) => string;
  hasModule: (moduleKey: keyof TenantModules) => boolean;
  switchTenant: (slug: string) => void;
  availableTenants: Tenant[];
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({
  initialSlug = DEFAULT_TENANT_SLUG,
  children
}: {
  initialSlug?: string;
  children: React.ReactNode;
}) {
  const [currentSlug, setCurrentSlug] = useState<string>(initialSlug);

  const tenant = useMemo(() => {
    return getTenantBySlug(currentSlug);
  }, [currentSlug]);

  const isSuspended = tenant.planState === 'suspended';

  const formatPrice = React.useCallback((amount: number) => {
    const { symbol, position } = tenant.currency;
    const formattedNum = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return position === 'prefix' ? `${symbol}${formattedNum}` : `${formattedNum} ${symbol}`;
  }, [tenant.currency]);

  const hasModule = React.useCallback((moduleKey: keyof TenantModules): boolean => {
    return Boolean(tenant.modules[moduleKey]);
  }, [tenant.modules]);

  const availableTenants = useMemo(() => Object.values(mockTenants), []);

  const value = useMemo<TenantContextValue>(() => ({
    tenant,
    isSuspended,
    formatPrice,
    hasModule,
    switchTenant: (slug: string) => setCurrentSlug(slug),
    availableTenants
  }), [tenant, isSuspended, formatPrice, hasModule, availableTenants]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    const fallbackTenant = mockTenants[DEFAULT_TENANT_SLUG];
    return {
      tenant: fallbackTenant,
      isSuspended: false,
      formatPrice: (amount: number) => `৳${amount.toLocaleString()}`,
      hasModule: () => true,
      switchTenant: () => {},
      availableTenants: Object.values(mockTenants)
    };
  }
  return ctx;
}
