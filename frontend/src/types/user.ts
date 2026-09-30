import type { UserRole } from '@/constants/roles';

export type { UserRole };

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  initials?: string;
  phone?: string;
  title?: string;
}
