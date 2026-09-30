import React from 'react';
import { getUserInfo } from '@/services/auth/getUserInfo';
import { getNavItemsByRole, type NavItem } from '@/config/menu-items';
import { DashboardSidebarContent } from './DashboardSidebarContent';
import type { UserInfo } from '@/types/user';

interface DashboardSidebarProps {
  navItems?: NavItem[];
  user?: UserInfo;
}

export async function DashboardSidebar({
  navItems: propNavItems,
  user: propUser,
}: DashboardSidebarProps = {}) {
  const user = propUser || (await getUserInfo());
  const navItems = propNavItems || getNavItemsByRole(user?.role);

  return (
    <aside className="hidden lg:block w-60 shrink-0 h-screen sticky top-0 z-40 border-r border-line bg-canvas">
      <DashboardSidebarContent navItems={navItems} user={user} />
    </aside>
  );
}
