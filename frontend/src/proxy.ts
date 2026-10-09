import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { parseJwtPayload } from './utils/jwt';

// Staff roles permitted on the admin dashboard
const STAFF_ROLES = ['OWNER', 'ADMIN', 'SUPER_ADMIN', 'MANAGER', 'STAFF'];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Extract access token and refresh token
  const token = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  const jwtPayload = token ? parseJwtPayload(token) : null;
  const isTokenExpired = Boolean(jwtPayload?.exp && Date.now() >= jwtPayload.exp * 1000);
  const isAuthenticated = Boolean(token && !isTokenExpired && jwtPayload);

  const refreshPayload = refreshToken ? parseJwtPayload(refreshToken) : null;
  const isRefreshTokenExpired = Boolean(
    refreshPayload?.exp && Date.now() >= refreshPayload.exp * 1000
  );
  const hasValidRefreshToken = Boolean(refreshToken && !isRefreshTokenExpired && refreshPayload);

  // Active or renewable session check
  const canAuthenticate = isAuthenticated || hasValidRefreshToken;
  const activePayload = isAuthenticated ? jwtPayload : (hasValidRefreshToken ? refreshPayload : null);
  const userRole = (activePayload?.role || '').toUpperCase();
  const isStaff = STAFF_ROLES.includes(userRole);

  const isAdminRoute = pathname.startsWith('/admin');
  const isAccountRoute = pathname.startsWith('/account');

  // Protected routes guard: redirect unauthenticated users to login
  if ((isAdminRoute || isAccountRoute) && !canAuthenticate) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    const response = NextResponse.redirect(loginUrl);
    if (isTokenExpired || isRefreshTokenExpired) {
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
    }
    return response;
  }

  // Cross-role boundary redirects for authenticated users
  if (isAdminRoute && !isStaff) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  if (isAccountRoute && isStaff) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Auth pages (/login, /register): redirect already-authenticated users
  if ((pathname === '/login' || pathname === '/register') && canAuthenticate) {
    const nextParam = request.nextUrl.searchParams.get('next');
    const destination =
      nextParam && !nextParam.startsWith('/login') && !nextParam.startsWith('/register')
        ? nextParam
        : isStaff
        ? '/admin'
        : '/account';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};