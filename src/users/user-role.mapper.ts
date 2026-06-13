import { UserRole, UserStatus } from '@prisma/client';

const API_TO_DB_ROLE: Record<string, UserRole> = {
  tourist: UserRole.TOURIST,
  guide: UserRole.GUIDE,
  admin: UserRole.ADMIN,
  support: UserRole.SUPPORT,
};

export const PUBLIC_REGISTER_ROLES = ['tourist', 'guide'] as const;
export const API_ROLES = ['tourist', 'guide', 'admin', 'support'] as const;

export type ApiRole = (typeof API_ROLES)[number];

export function toDbRole(role: ApiRole): UserRole {
  return API_TO_DB_ROLE[role];
}

export function toApiRole(role: UserRole): ApiRole {
  return role.toLowerCase() as ApiRole;
}

export function toApiStatus(status: UserStatus): string {
  return status.toLowerCase();
}
