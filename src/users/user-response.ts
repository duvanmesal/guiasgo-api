import { Prisma, UserRole } from '@prisma/client';
import { toApiRole, toApiStatus } from './user-role.mapper';

export const userWithRolesInclude = {
  roles: true,
} satisfies Prisma.UserInclude;

export type UserWithRoles = Prisma.UserGetPayload<{
  include: typeof userWithRolesInclude;
}>;

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  photoUrl: string | null;
  status: string;
  roles: string[];
  activeRole: string | null;
  createdAt: string;
  updatedAt: string;
}

export function mapUserResponse(user: UserWithRoles): UserResponse {
  const roles = user.roles.map((role) => role.role);
  const activeRole = user.lastActiveRole ?? roles[0] ?? null;

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    photoUrl: user.photoUrl,
    status: toApiStatus(user.status),
    roles: roles.map(toApiRole),
    activeRole: activeRole ? toApiRole(activeRole as UserRole) : null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
