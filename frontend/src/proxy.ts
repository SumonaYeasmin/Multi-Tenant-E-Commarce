import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Pure TypeScript JWT payload parser without external binary dependencies
function parseJwtPayload(token: string): {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
  tenantId?: string;
} | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Next.js 16 Network Boundary Proxy (handles RBAC routing, protection and multi-tenancy)
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hostname = request.headers.get('host') || 'localhost:3000';
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost';
  const hostWithoutPort = hostname.split(':')[0].toLowerCase();

  // Multi-tenant hostname resolution
  let tenantSlug = 'tanti';
  if (
    hostWithoutPort !== rootDomain &&
    hostWithoutPort !== `www.${rootDomain}` &&
    hostWithoutPort !== 'localhost' &&
    hostWithoutPort !== '127.0.0.1'
  ) {
    if (hostWithoutPort.endsWith(`.${rootDomain}`) || hostWithoutPort.endsWith('.localhost')) {
      const parts = hostWithoutPort.split('.');
      if (parts.length > 0 && parts[0] !== 'www') {
        tenantSlug = parts[0];
      }
    } else {
      tenantSlug = hostWithoutPort.replace(/\./g, '-');
    }
  }

  // Token and role extraction from secure cookies
  const token = request.cookies.get('auth_token')?.value;
  const cookieRole = request.cookies.get('auth_role')?.value;

  const jwtPayload = token ? parseJwtPayload(token) : null;
  const isTokenExpired = Boolean(jwtPayload?.exp && Date.now() >= jwtPayload.exp * 1000);
  const isAuthenticated = Boolean(token && !isTokenExpired && jwtPayload);
  const userRole = (jwtPayload?.role || cookieRole || '').toUpperCase();

  // Allowed administrative roles for merchant dashboard
  const isStaffOrOwner = ['OWNER', 'ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF'].includes(userRole);

  // Route 1: Owner / Admin Dashboard Protection (/admin and sub-routes)
  if (pathname.startsWith('/admin')) {
    // If not authenticated, immediately redirect to login with return path
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', `${pathname}${search}`);
      const response = NextResponse.redirect(loginUrl);
      if (isTokenExpired) {
        response.cookies.delete('auth_token');
        response.cookies.delete('auth_role');
        response.cookies.delete('auth_user');
      }
      return response;
    }

    // If authenticated as customer, strictly forbid access to owner dashboard
    if (!isStaffOrOwner) {
      const accountUrl = new URL('/account', request.url);
      return NextResponse.redirect(accountUrl);
    }
  }

  // Route 2: Customer Account Dashboard Protection (/account and sub-routes)
  if (pathname.startsWith('/account')) {
    // If unauthenticated visitor types /account, redirect to login
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', `${pathname}${search}`);
      const response = NextResponse.redirect(loginUrl);
      if (isTokenExpired) {
        response.cookies.delete('auth_token');
        response.cookies.delete('auth_role');
        response.cookies.delete('auth_user');
      }
      return response;
    }
  }

  // Route 3: Auth Pages Redirection for already logged-in users (/login, /register)
  if (pathname === '/login' || pathname === '/register') {
    if (isAuthenticated) {
      const nextParam = request.nextUrl.searchParams.get('next');
      if (nextParam && !nextParam.startsWith('/login') && !nextParam.startsWith('/register')) {
        // If customer tried to go to an admin url via next param, route to customer dashboard
        if (nextParam.startsWith('/admin') && !isStaffOrOwner) {
          return NextResponse.redirect(new URL('/account', request.url));
        }
        return NextResponse.redirect(new URL(nextParam, request.url));
      }

      // Default role-based dashboard destination
      if (isStaffOrOwner) {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else {
        return NextResponse.redirect(new URL('/account', request.url));
      }
    }
  }

  // Propagate tenant and user claims downstream via headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-slug', tenantSlug);
  requestHeaders.set('x-tenant-host', hostWithoutPort);

  if (isAuthenticated && jwtPayload) {
    if (jwtPayload.sub) requestHeaders.set('x-user-id', jwtPayload.sub);
    if (userRole) requestHeaders.set('x-user-role', userRole);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    // Match all paths except internal nextjs static assets and image files
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};