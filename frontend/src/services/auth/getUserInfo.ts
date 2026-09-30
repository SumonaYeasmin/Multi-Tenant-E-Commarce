import type { UserInfo } from '@/types/user';

export const mockUsers: Record<string, UserInfo> = {
  admin: {
    id: 'u-admin-1',
    name: 'Shahana Parvin',
    email: 'shahana@tanti.com.bd',
    role: 'OWNER',
    initials: 'SP',
    title: 'Owner',
  },
};

export async function getUserInfo(): Promise<UserInfo> {
  return mockUsers.admin;
}
