'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { authService } from '@/services/auth';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Non-blocking client-side verification on SPA transitions (server proxy already protects initial SSR)
    const isAuthed = authService.isAuthenticated();
    const storedUser = authService.getStoredUser();
    const role = (storedUser?.role || authService.getUserRole() || '').toUpperCase();
    const isStaffOrOwner = ['OWNER', 'ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF'].includes(role);

    if (!isAuthed) {
      window.location.href = `/login?next=${encodeURIComponent(pathname || '/admin')}`;
      return;
    }

    if (!isStaffOrOwner) {
      window.location.href = '/account';
      return;
    }

    const isOwner = Boolean(
      storedUser?.isOwner ||
      role === 'OWNER' ||
      role === 'SUPER_ADMIN' ||
      storedUser?.staffRole?.toLowerCase() === 'owner'
    );

    // If owner, full access to all admin routes
    if (isOwner) return;

    // For staff members, check module permissions
    if (storedUser?.permissions && typeof storedUser.permissions === 'object') {
      const perms = storedUser.permissions as Record<string, string[]>;
      
      const routeModuleMap: Record<string, string> = {
        '/admin/orders': 'orders',
        '/admin/returns': 'returns',
        '/admin/payments': 'payments',
        '/admin/products': 'products',
        '/admin/categories': 'products',
        '/admin/collections': 'products',
        '/admin/brands': 'products',
        '/admin/inventory': 'inventory',
        '/admin/customers': 'customers',
        '/admin/reviews': 'reviews',
        '/admin/discounts': 'discounts',
        '/admin/marketing': 'marketing',
        '/admin/shipping': 'shipping',
        '/admin/theme': 'theme',
        '/admin/content': 'content',
        '/admin/media': 'media',
        '/admin/seo': 'content',
        '/admin/domains': 'domains',
        '/admin/analytics': 'analytics',
        '/admin/reports': 'reports',
        '/admin/staff': 'staff',
        '/admin/notifications': 'notifications',
        '/admin/integrations': 'integrations',
        '/admin/settings': 'settings',
        '/admin/audit': 'audit',
        '/admin/billing': 'billing',
        '/admin': 'dashboard',
      };

      // Match current pathname to module
      let currentModule = 'dashboard';
      for (const [route, mod] of Object.entries(routeModuleMap)) {
        if (route !== '/admin' && (pathname === route || pathname.startsWith(`${route}/`))) {
          currentModule = mod;
          break;
        }
      }

      const hasAccess = currentModule === 'billing'
        ? false
        : (perms[currentModule]?.includes('view') ?? false);

      // If user cannot access this module, find their first allowed module and redirect
      if (!hasAccess) {
        let firstAllowedRoute = '';
        if (perms.payments?.includes('view')) firstAllowedRoute = '/admin/payments';
        else if (perms.orders?.includes('view')) firstAllowedRoute = '/admin/orders';
        else if (perms.returns?.includes('view')) firstAllowedRoute = '/admin/returns';
        else if (perms.products?.includes('view')) firstAllowedRoute = '/admin/products';
        else if (perms.inventory?.includes('view')) firstAllowedRoute = '/admin/inventory';
        else if (perms.customers?.includes('view')) firstAllowedRoute = '/admin/customers';
        else if (perms.reviews?.includes('view')) firstAllowedRoute = '/admin/reviews';
        else if (perms.discounts?.includes('view')) firstAllowedRoute = '/admin/discounts';
        else if (perms.marketing?.includes('view')) firstAllowedRoute = '/admin/marketing';
        else if (perms.shipping?.includes('view')) firstAllowedRoute = '/admin/shipping';
        else if (perms.theme?.includes('view')) firstAllowedRoute = '/admin/theme';
        else if (perms.content?.includes('view')) firstAllowedRoute = '/admin/content';
        else if (perms.media?.includes('view')) firstAllowedRoute = '/admin/media';
        else if (perms.analytics?.includes('view')) firstAllowedRoute = '/admin/analytics';
        else if (perms.reports?.includes('view')) firstAllowedRoute = '/admin/reports';
        else if (perms.staff?.includes('view')) firstAllowedRoute = '/admin/staff';
        else if (perms.settings?.includes('view')) firstAllowedRoute = '/admin/settings';
        else if (perms.notifications?.includes('view')) firstAllowedRoute = '/admin/notifications';
        else if (perms.integrations?.includes('view')) firstAllowedRoute = '/admin/integrations';
        else if (perms.dashboard?.includes('view')) firstAllowedRoute = '/admin';

        if (firstAllowedRoute && pathname !== firstAllowedRoute) {
          window.location.href = firstAllowedRoute;
        }
      }
    }
  }, [pathname]);

  return <>{children}</>;
}
