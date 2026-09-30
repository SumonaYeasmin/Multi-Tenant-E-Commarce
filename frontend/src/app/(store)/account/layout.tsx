import React from 'react';
import { AccountLayout } from '@/components/account/AccountLayout';

export const metadata = {
  title: 'My Account | Tanti',
  description: 'Manage your profile, orders, addresses, and preferences.',
};

export default function AccountRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountLayout>{children}</AccountLayout>;
}
