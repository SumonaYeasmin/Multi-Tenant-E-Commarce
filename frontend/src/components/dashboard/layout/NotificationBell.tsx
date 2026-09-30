'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import type { UserInfo } from '@/types/user';

interface NotificationItem {
  id: string;
  text: string;
  time: string;
  href: string;
  unread?: boolean;
}

const mockNotifications: NotificationItem[] = [
  {
    id: 'n-1',
    text: 'New order TN-10498 from Rafiq Hossain (৳4,800)',
    time: '12 min ago',
    href: '/admin/orders',
    unread: true,
  },
  {
    id: 'n-2',
    text: '4 products have variants at or below 2 units in stock',
    time: '2 hours ago',
    href: '/admin/inventory',
    unread: true,
  },
  {
    id: 'n-3',
    text: 'Return R-3012 requested by Mehedi Hasan',
    time: 'Yesterday',
    href: '/admin/returns',
    unread: false,
  },
];

interface NotificationBellProps {
  user?: UserInfo;
}

export function NotificationBell({}: NotificationBellProps = {}) {
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

  const hasUnread = mockNotifications.some((n) => n.unread);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-md p-2 hover:bg-subtle text-ink cursor-pointer transition-colors"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-[18px] w-[18px]" />
        {hasUnread && (
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-clay"
            aria-hidden="true"
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-lg border border-line bg-surface shadow-pop animate-in fade-in-0 slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            <span className="text-[11px] font-medium text-clay hover:underline cursor-pointer">
              Mark all as read
            </span>
          </div>

          <ul className="max-h-80 overflow-y-auto divide-y divide-line">
            {mockNotifications.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-[13px] hover:bg-canvas transition-colors"
                >
                  <p className="text-ink leading-snug">{n.text}</p>
                  <span className="mt-1 block text-xs text-ink-muted">{n.time}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-line px-4 py-2 text-center bg-canvas/40">
            <Link
              href="/admin/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-ink-muted hover:text-ink transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
