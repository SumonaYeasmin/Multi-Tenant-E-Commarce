import type { UserInfo } from '@/types/user';

export const fallbackUser: UserInfo = {
  id: 'u-owner-1',
  name: 'Store Owner',
  email: 'owner@store.com',
  role: 'OWNER',
  initials: 'SO',
  title: 'Owner',
};

export async function getUserInfo(): Promise<UserInfo> {
  return fallbackUser;
}
