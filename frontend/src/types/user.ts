export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'USER';

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
