'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { authService } from '@/services/auth';
import { Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      // 1. If currently valid access token exists
      if (authService.isAuthenticated()) {
        const role = (authService.getUserRole() || '').toUpperCase();
        const isStaffOrOwner = ['OWNER', 'ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF'].includes(role);

        if (!isStaffOrOwner) {
          window.location.href = '/account';
          return;
        }

        if (isMounted) setIsVerifying(false);
        return;
      }

      // 2. If access token is expired or missing, but valid refresh token exists, attempt silent refresh
      if (authService.hasValidRefreshToken()) {
        const newToken = await authService.refreshToken();
        if (newToken && isMounted) {
          const role = (authService.getUserRole() || '').toUpperCase();
          const isStaffOrOwner = ['OWNER', 'ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF'].includes(role);

          if (!isStaffOrOwner) {
            window.location.href = '/account';
            return;
          }

          setIsVerifying(false);
          return;
        }
      }

      // 3. If neither valid access token nor valid refresh token exists, redirect to login
      if (isMounted) {
        window.location.href = `/login?next=${encodeURIComponent(pathname || '/admin')}`;
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  if (isVerifying) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-clay" />
          <p className="text-sm font-medium text-ink-muted">Verifying session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

