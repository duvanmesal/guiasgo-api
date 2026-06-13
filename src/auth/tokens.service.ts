import { randomUUID } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { UserWithRoles } from '../users/user-response';
import { AccessTokenPayload, RefreshTokenPayload } from './types/jwt-payload.type';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface ValidRefreshToken {
  payload: RefreshTokenPayload;
  user: UserWithRoles;
}

@Injectable()
export class TokensService {
  private readonly accessTokenExpiresIn = '15m';
  private readonly refreshTokenExpiresIn = '30d';
  private readonly refreshTokenDays = 30;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async createTokenPair(
    user: UserWithRoles,
    activeRole: UserRole,
    sessionId = randomUUID(),
  ): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(user, activeRole, sessionId),
      this.createRefreshToken(user.id, sessionId),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  createAccessToken(
    user: UserWithRoles,
    activeRole: UserRole,
    sessionId: string,
  ): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.role),
      activeRole,
      sessionId,
      type: 'access',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.accessTokenExpiresIn,
    });
  }

  async createRefreshToken(
    userId: string,
    sessionId: string,
  ): Promise<string> {
    const tokenId = randomUUID();
    const payload: RefreshTokenPayload = {
      sub: userId,
      jti: tokenId,
      sessionId,
      type: 'refresh',
    };
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.refreshTokenExpiresIn,
    });
    const tokenHash = await argon2.hash(refreshToken);
    const expiresAt = new Date(
      Date.now() + this.refreshTokenDays * 24 * 60 * 60 * 1000,
    );

    await this.prisma.refreshToken.create({
      data: {
        id: tokenId,
        userId,
        tokenHash,
        sessionId,
        expiresAt,
      },
    });

    return refreshToken;
  }

  async rotateRefreshToken(
    refreshToken: string,
    activeRole: UserRole,
  ): Promise<TokenPair> {
    const validToken = await this.validateRefreshToken(refreshToken);
    const nextRefreshToken = await this.createRefreshToken(
      validToken.user.id,
      validToken.payload.sessionId,
    );

    await this.prisma.refreshToken.update({
      where: { id: validToken.payload.jti },
      data: {
        revokedAt: new Date(),
        replacedByTokenId: this.getTokenId(nextRefreshToken),
      },
    });

    const accessToken = await this.createAccessToken(
      validToken.user,
      activeRole,
      validToken.payload.sessionId,
    );

    return {
      accessToken,
      refreshToken: nextRefreshToken,
    };
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const validToken = await this.validateRefreshToken(refreshToken);

    await this.prisma.refreshToken.update({
      where: { id: validToken.payload.jti },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async validateRefreshToken(
    refreshToken: string,
  ): Promise<ValidRefreshToken> {
    const payload = await this.verifyRefreshPayload(refreshToken);
    const token = await this.prisma.refreshToken.findUnique({
      where: { id: payload.jti },
      include: {
        user: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (
      !token ||
      token.revokedAt ||
      token.expiresAt <= new Date() ||
      token.user.deletedAt ||
      token.user.status !== UserStatus.ACTIVE
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenMatches = await argon2.verify(token.tokenHash, refreshToken);

    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      payload,
      user: token.user,
    };
  }

  private async verifyRefreshPayload(
    refreshToken: string,
  ): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );

      if (payload.type !== 'refresh' || !payload.jti || !payload.sessionId) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private getTokenId(refreshToken: string): string {
    const decoded = this.jwtService.decode<RefreshTokenPayload>(refreshToken);

    if (!decoded?.jti) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return decoded.jti;
  }
}
