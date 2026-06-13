import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { mapUserResponse, UserResponse, UserWithRoles } from '../users/user-response';
import { toDbRole } from '../users/user-role.mapper';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { SelectRoleDto } from './dto/select-role.dto';
import { TokenPair, TokensService } from './tokens.service';

export interface AuthResponse extends TokenPair {
  user: UserResponse;
}

export interface SelectRoleResponse {
  accessToken: string;
  user: UserResponse;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokensService: TokensService,
    private readonly usersService: UsersService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();
    const initialRole = toDbRole(dto.initialRole ?? 'tourist');
    const passwordHash = await argon2.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName: dto.fullName.trim(),
          phone: dto.phone?.trim(),
          status: UserStatus.ACTIVE,
          lastActiveRole: initialRole,
          roles: {
            create: {
              role: initialRole,
            },
          },
        },
        include: {
          roles: true,
        },
      });

      return this.createAuthResponse(user, initialRole);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email is already registered');
      }

      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await argon2.verify(
      user.passwordHash,
      dto.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const activeRole = this.resolveActiveRole(user);

    return this.createAuthResponse(user, activeRole);
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponse> {
    const validToken = await this.tokensService.validateRefreshToken(
      dto.refreshToken,
    );
    const activeRole = this.resolveActiveRole(validToken.user);
    const tokens = await this.tokensService.rotateRefreshToken(
      dto.refreshToken,
      activeRole,
    );

    return {
      user: mapUserResponse(validToken.user),
      ...tokens,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokensService.revokeRefreshToken(refreshToken);
  }

  async selectRole(
    currentUser: AuthenticatedUser,
    dto: SelectRoleDto,
  ): Promise<SelectRoleResponse> {
    const nextRole = toDbRole(dto.role);
    const user = await this.usersService.findActiveById(currentUser.id);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const hasRole = user.roles.some((role) => role.role === nextRole);

    if (!hasRole) {
      throw new ForbiddenException('Role is not assigned to this user');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastActiveRole: nextRole,
      },
      include: {
        roles: true,
      },
    });
    const accessToken = await this.tokensService.createAccessToken(
      updatedUser,
      nextRole,
      currentUser.sessionId,
    );

    return {
      accessToken,
      user: mapUserResponse(updatedUser),
    };
  }

  private async createAuthResponse(
    user: UserWithRoles,
    activeRole: UserRole,
  ): Promise<AuthResponse> {
    const tokens = await this.tokensService.createTokenPair(user, activeRole);

    return {
      user: mapUserResponse(user),
      ...tokens,
    };
  }

  private resolveActiveRole(user: UserWithRoles): UserRole {
    const roles = user.roles.map((role) => role.role);

    if (!roles.length) {
      throw new ForbiddenException('User does not have assigned roles');
    }

    if (user.lastActiveRole && roles.includes(user.lastActiveRole)) {
      return user.lastActiveRole;
    }

    return roles[0];
  }
}
