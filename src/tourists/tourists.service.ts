import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateTouristProfileDto } from './dto/create-tourist-profile.dto';
import { UpdateTouristProfileDto } from './dto/update-tourist-profile.dto';
import {
  mapTouristProfileResponse,
  TouristProfileResponse,
} from './tourist-profile.response';

@Injectable()
export class TouristsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async createProfile(
    userId: string,
    dto: CreateTouristProfileDto,
  ): Promise<TouristProfileResponse> {
    await this.usersService.ensureRole(userId, UserRole.TOURIST);

    try {
      const profile = await this.prisma.touristProfile.create({
        data: {
          userId,
          nationality: dto.nationality?.trim(),
          preferredLanguage: dto.preferredLanguage?.trim(),
          emergencyContact: dto.emergencyContact?.trim(),
          interests: dto.interests ?? [],
        },
      });

      return mapTouristProfileResponse(profile);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Tourist profile already exists');
      }

      throw error;
    }
  }

  async getMyProfile(userId: string): Promise<TouristProfileResponse> {
    const profile = await this.prisma.touristProfile.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundException('Tourist profile not found');
    }

    return mapTouristProfileResponse(profile);
  }

  async updateMyProfile(
    userId: string,
    dto: UpdateTouristProfileDto,
  ): Promise<TouristProfileResponse> {
    const currentProfile = await this.prisma.touristProfile.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
    });

    if (!currentProfile) {
      throw new NotFoundException('Tourist profile not found');
    }

    const profile = await this.prisma.touristProfile.update({
      where: { id: currentProfile.id },
      data: {
        nationality: dto.nationality?.trim(),
        preferredLanguage: dto.preferredLanguage?.trim(),
        emergencyContact: dto.emergencyContact?.trim(),
        interests: dto.interests,
      },
    });

    return mapTouristProfileResponse(profile);
  }
}
