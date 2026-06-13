import { UserRole, UserStatus } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  status: UserStatus;
  roles: UserRole[];
  activeRole: UserRole;
  sessionId: string;
}
