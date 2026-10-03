// Authentication session storage manager using secure HTTP Cookies exclusively (No localStorage duplication)
import { getCookie, setCookie, deleteCookie } from '@/utils/cookies';
import type { StoredUser, UserRole } from '@/types';

export function setAuthSession(session: {
  accessToken: string;
  refreshToken?: string;
  user?: StoredUser;
}) {
  if (typeof window === 'undefined') return;

  const { accessToken, refreshToken, user } = session;

  // Save tokens exclusively in Cookies for unified server proxy, SSR, and client access
  setCookie('auth_token', accessToken, 30);

  if (refreshToken) {
    setCookie('refresh_token', refreshToken, 30);
  }

  if (user) {
    const role: UserRole = user.role || 'CUSTOMER';
    setCookie('auth_role', role, 30);
    setCookie('auth_user', JSON.stringify(user), 30);
  }

  // Purge any stale or legacy localStorage entries for maximum security
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('auth_role');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('user');
  } catch {}
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;

  // Clear all auth cookies
  deleteCookie('auth_token');
  deleteCookie('refresh_token');
  deleteCookie('auth_role');
  deleteCookie('auth_user');

  // Purge any legacy localStorage keys
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('auth_role');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('user');
  } catch {}
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return getCookie('auth_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return getCookie('refresh_token');
}

export function getAuthUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = getCookie('auth_user');
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function getAuthRole(): UserRole | null {
  if (typeof window === 'undefined') return null;
  const cookieRole = getCookie('auth_role') as UserRole | null;
  if (cookieRole) return cookieRole;
  const user = getAuthUser();
  return (user?.role || null) as UserRole | null;
}

export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) return false;

  // Verify JWT expiration claim client-side
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return false;
      }
    }
  } catch {
    return false;
  }

  return true;
}
