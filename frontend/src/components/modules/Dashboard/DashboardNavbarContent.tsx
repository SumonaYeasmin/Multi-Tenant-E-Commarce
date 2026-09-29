'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { DashboardMobileSidebar } from './DashboardMobileSidebar';
import { NotificationBell } from './NotificationBell';
import { UserDropdown } from './UserDropdown';
import type { NavItem } from '@/lib/navitems.config';
import type { UserInfo } from '@/types/user';

interface DashboardNavbarContentProps {
  user?: UserInfo;
  navItems: NavItem[];
}

export function DashboardNavbarContent({
  user,
  navItems,
}: DashboardNavbarContentProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-4">
      {/* Left: Mobile Sidebar Trigger + Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {/* Mobile menu drawer trigger */}
        <DashboardMobileSidebar navItems={navItems} user={user} />

        {/* Global Search Bar matching exact e-commerce styling */}
        <div className="relative flex h-9 w-full items-center gap-2 rounded-md border border-line bg-canvas px-3 text-[13px] text-ink-muted hover:border-line-strong transition-colors">
          <Search className="h-4 w-4 text-ink-muted shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders, products, customers…"
            className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-muted focus:outline-none"
          />
          <kbd className="hidden rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] font-medium text-ink-muted sm:inline select-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Plan badge, Notifications, and User Profile */}
      <div className="flex items-center gap-2">
        {/* Subscription Plan Badge */}
        <Link
          href="/admin/billing"
          className="hidden whitespace-nowrap rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-soft hover:border-ink hover:text-ink transition-colors sm:inline-block"
        >
          Growth plan
        </Link>

        {/* Notifications Popover */}
        <NotificationBell user={user} />

        {/* User Account / Profile Dropdown */}
        <UserDropdown user={user} />
      </div>
    </header>
  );
}
