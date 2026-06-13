import { UserRole } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  roles: UserRole[];
  activeRole: UserRole;
  sessionId: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  sessionId: string;
  type: 'refresh';
}
