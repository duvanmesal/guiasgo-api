import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { GuideVerificationStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateGuideProfileDto } from './dto/create-guide-profile.dto';
import { UpdateGuideProfileDto } from './dto/update-guide-profile.dto';
import { UpdateGuideVerificationDto } from './dto/update-guide-verification.dto';
import {
  mapGuideProfileResponse,
  GuideProfileResponse,
  toDbGuideVerificationStatus,
  toDecimal,
} from './guide-profile.response';

@Injectable()
export class GuidesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async createProfile(
    userId: string,
    dto: CreateGuideProfileDto,
  ): Promise<GuideProfileResponse> {
    await this.usersService.ensureRole(userId, UserRole.GUIDE);

    try {
      const profile = await this.prisma.guideProfile.create({
        data: {
          userId,
          bio: dto.bio.trim(),
          city: dto.city.trim(),
          languages: dto.languages,
          specialties: dto.specialties,
          hourlyRate: toDecimal(dto.hourlyRate),
          supportsHourly: dto.supportsHourly ?? true,
          supportsRoute: dto.supportsRoute ?? false,
          yearsExperience: dto.yearsExperience ?? 0,
          latitude: dto.latitude,
          longitude: dto.longitude,
          verificationStatus: GuideVerificationStatus.PENDING,
          isAvailable: false,
        },
      });

      return mapGuideProfileResponse(profile);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Guide profile already exists');
      }

      throw error;
    }
  }

  async getMyProfile(userId: string): Promise<GuideProfileResponse> {
    const profile = await this.findProfileByUserId(userId);
    return mapGuideProfileResponse(profile);
  }

  async updateMyProfile(
    userId: string,
    dto: UpdateGuideProfileDto,
  ): Promise<GuideProfileResponse> {
    const currentProfile = await this.findProfileByUserId(userId);
    const profile = await this.prisma.guideProfile.update({
      where: { id: currentProfile.id },
      data: {
        bio: dto.bio?.trim(),
        city: dto.city?.trim(),
        languages: dto.languages,
        specialties: dto.specialties,
        hourlyRate:
          dto.hourlyRate === undefined ? undefined : toDecimal(dto.hourlyRate),
        supportsHourly: dto.supportsHourly,
        supportsRoute: dto.supportsRoute,
        yearsExperience: dto.yearsExperience,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });

    return mapGuideProfileResponse(profile);
  }

  async updateVerificationStatus(
    guideId: string,
    dto: UpdateGuideVerificationDto,
  ): Promise<GuideProfileResponse> {
    const profile = await this.prisma.guideProfile.findFirst({
      where: {
        id: guideId,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundException('Guide profile not found');
    }

    const updatedProfile = await this.prisma.guideProfile.update({
      where: { id: guideId },
      data: {
        verificationStatus: toDbGuideVerificationStatus(dto.status),
        isAvailable:
          dto.status === 'approved' ? profile.isAvailable : false,
      },
    });

    return mapGuideProfileResponse(updatedProfile);
  }

  async findProfileByUserId(userId: string) {
    const profile = await this.prisma.guideProfile.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundException('Guide profile not found');
    }

    return profile;
  }
}
