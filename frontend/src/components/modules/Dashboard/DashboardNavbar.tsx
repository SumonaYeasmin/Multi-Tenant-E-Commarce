import React from 'react';
import { getUserInfo } from '@/services/auth/getUserInfo';
import { getNavItemsByRole, type NavItem } from '@/config/menu-items';
import { DashboardNavbarContent } from './DashboardNavbarContent';
import type { UserInfo } from '@/types/user';

interface DashboardNavbarProps {
  user?: UserInfo;
  navItems?: NavItem[];
}

export async function DashboardNavbar({
  user: propUser,
  navItems: propNavItems,
}: DashboardNavbarProps = {}) {
  const user = propUser || (await getUserInfo());
  const navItems = propNavItems || getNavItemsByRole(user?.role);

  return <DashboardNavbarContent user={user} navItems={navItems} />;
}
