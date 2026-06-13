import { Injectable, NotFoundException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';
import {
  mapUserResponse,
  UserResponse,
  userWithRolesInclude,
  UserWithRoles,
} from './user-response';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<UserWithRoles | null> {
    return this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: userWithRolesInclude,
    });
  }

  findActiveById(id: string): Promise<UserWithRoles | null> {
    return this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
        status: UserStatus.ACTIVE,
      },
      include: userWithRolesInclude,
    });
  }

  findByEmail(email: string): Promise<UserWithRoles | null> {
    return this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      include: userWithRolesInclude,
    });
  }

  async getMe(userId: string): Promise<UserResponse> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return mapUserResponse(user);
  }

  async updateMe(userId: string, dto: UpdateMeDto): Promise<UserResponse> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        photoUrl: dto.photoUrl,
      },
      include: userWithRolesInclude,
    });

    return mapUserResponse(user);
  }
}
