import { UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('registers a user with a hashed password and initial role', async () => {
    const createdAt = new Date('2026-06-13T00:00:00.000Z');
    const prisma = {
      user: {
        create: jest.fn(async ({ data }) => ({
          id: 'user-1',
          email: data.email,
          passwordHash: data.passwordHash,
          fullName: data.fullName,
          phone: data.phone,
          photoUrl: null,
          status: UserStatus.ACTIVE,
          lastActiveRole: data.lastActiveRole,
          roles: [{ id: 'role-1', userId: 'user-1', role: data.roles.create.role, assignedAt: createdAt }],
          refreshTokens: [],
          createdAt,
          updatedAt: createdAt,
          deletedAt: null,
        })),
      },
    };
    const tokensService = {
      createTokenPair: jest.fn(async () => ({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      })),
    };
    const usersService = {};
    const service = new AuthService(
      prisma as never,
      tokensService as never,
      usersService as never,
    );

    const response = await service.register({
      email: '  CAMILA@EXAMPLE.COM ',
      password: 'strong-password',
      fullName: ' Camila Rojas ',
      phone: '+57 300 000 0000',
      initialRole: 'guide',
    });
    const createCall = prisma.user.create.mock.calls[0][0];

    expect(createCall.data.email).toBe('camila@example.com');
    expect(createCall.data.passwordHash).not.toBe('strong-password');
    await expect(
      argon2.verify(createCall.data.passwordHash, 'strong-password'),
    ).resolves.toBe(true);
    expect(createCall.data.roles.create.role).toBe(UserRole.GUIDE);
    expect(response.user.roles).toEqual(['guide']);
    expect(response.accessToken).toBe('access-token');
    expect(response.refreshToken).toBe('refresh-token');
  });
});
