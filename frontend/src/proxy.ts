import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Network Boundary Proxy (formerly Middleware)
 * Handles multi-tenant hostname resolution, subdomain extraction,
 * and passes tenant context headers downstream.
 */
export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || 'localhost:3000';

  // Root platform domain configured in environment or fallback to localhost
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost';

  // Extract clean hostname without port
  const hostWithoutPort = hostname.split(':')[0].toLowerCase();

  // Determine tenant slug
  let tenantSlug = 'tanti'; // default fallback tenant

  if (hostWithoutPort !== rootDomain && hostWithoutPort !== `www.${rootDomain}` && hostWithoutPort !== 'localhost' && hostWithoutPort !== '127.0.0.1') {
    // Check if subdomain (e.g., store1.platform.com or store1.localhost)
    if (hostWithoutPort.endsWith(`.${rootDomain}`) || hostWithoutPort.endsWith('.localhost')) {
      const parts = hostWithoutPort.split('.');
      if (parts.length > 0 && parts[0] !== 'www') {
        tenantSlug = parts[0];
      }
    } else {
      // Custom domain mapping (e.g. tanti.com.bd)
      tenantSlug = hostWithoutPort.replace(/\./g, '-');
    }
  }

  // Clone headers and inject tenant metadata
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-slug', tenantSlug);
  requestHeaders.set('x-tenant-host', hostWithoutPort);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets with extensions (.svg, .png, .jpg, .webp, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};