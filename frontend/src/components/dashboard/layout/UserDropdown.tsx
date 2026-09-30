'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, Settings, LogOut, ExternalLink } from 'lucide-react';
import type { UserInfo } from '@/types/user';

interface UserDropdownProps {
  user?: UserInfo;
}

export function UserDropdown({ user }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const displayName = user?.name || 'Shahana Parvin';
  const roleLabel = user?.role || 'OWNER';
  const initials = user?.initials || displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 pl-1 rounded-md p-1 hover:bg-subtle cursor-pointer transition-colors"
        aria-label="User profile menu"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-clay-soft text-xs font-semibold text-clay-dark shrink-0">
          {initials}
        </span>
        <div className="hidden leading-tight md:block text-left">
          <p className="whitespace-nowrap text-sm font-medium text-ink">{displayName}</p>
          <p className="whitespace-nowrap text-xs text-ink-muted">{roleLabel}</p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-56 rounded-lg border border-line bg-surface shadow-pop py-1 animate-in fade-in-0 slide-in-from-top-1 duration-150">
          <div className="px-3 py-2 border-b border-line">
            <p className="text-xs font-semibold text-ink">{displayName}</p>
            <p className="text-xs text-ink-muted truncate">{user?.email || 'shahana@tanti.com.bd'}</p>
          </div>

          <div className="py-1">
            <Link
              href="/admin/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-ink-soft hover:bg-subtle hover:text-ink transition-colors"
            >
              <Settings className="h-3.5 w-3.5 text-ink-muted" />
              <span>Store Settings</span>
            </Link>
            <Link
              href="/admin/staff"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-ink-soft hover:bg-subtle hover:text-ink transition-colors"
            >
              <User className="h-3.5 w-3.5 text-ink-muted" />
              <span>Account & Roles</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-ink-soft hover:bg-subtle hover:text-ink transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-ink-muted" />
              <span>View Online Store</span>
            </Link>
          </div>

          <div className="border-t border-line pt-1">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-danger hover:bg-danger-soft/40 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
