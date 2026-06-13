import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { GuideVerificationStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateGuideProfileDto } from './dto/create-guide-profile.dto';
import { SearchGuidesDto } from './dto/search-guides.dto';
import { UpdateGuideProfileDto } from './dto/update-guide-profile.dto';
import { UpdateGuideVerificationDto } from './dto/update-guide-verification.dto';
import {
  mapGuideProfileResponse,
  GuideProfileResponse,
  toDbGuideVerificationStatus,
  toDecimal,
} from './guide-profile.response';

export interface PaginatedGuidesResponse {
  items: GuideProfileResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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
    const city = await this.findCity(dto.city);
    const languageIds = await this.findLanguageIds(dto.languages);
    const specialtyIds = await this.findSpecialtyIds(dto.specialties);

    try {
      const profile = await this.prisma.guideProfile.create({
        data: {
          userId,
          bio: dto.bio.trim(),
          city: dto.city.trim(),
          cityId: city?.id,
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
          guideLanguages: {
            create: languageIds.map((languageId) => ({
              languageId,
            })),
          },
          guideSpecialties: {
            create: specialtyIds.map((specialtyId) => ({
              specialtyId,
            })),
          },
        },
        include: {
          user: true,
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
    const city = dto.city ? await this.findCity(dto.city) : undefined;
    const languageIds = dto.languages
      ? await this.findLanguageIds(dto.languages)
      : undefined;
    const specialtyIds = dto.specialties
      ? await this.findSpecialtyIds(dto.specialties)
      : undefined;

    const profile = await this.prisma.guideProfile.update({
      where: { id: currentProfile.id },
      data: {
        bio: dto.bio?.trim(),
        city: dto.city?.trim(),
        cityId: city?.id,
        languages: dto.languages,
        specialties: dto.specialties,
        hourlyRate:
          dto.hourlyRate === undefined ? undefined : toDecimal(dto.hourlyRate),
        supportsHourly: dto.supportsHourly,
        supportsRoute: dto.supportsRoute,
        yearsExperience: dto.yearsExperience,
        latitude: dto.latitude,
        longitude: dto.longitude,
        guideLanguages: languageIds
          ? {
              deleteMany: {},
              create: languageIds.map((languageId) => ({
                languageId,
              })),
            }
          : undefined,
        guideSpecialties: specialtyIds
          ? {
              deleteMany: {},
              create: specialtyIds.map((specialtyId) => ({
                specialtyId,
              })),
            }
          : undefined,
      },
      include: {
        user: true,
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

  async searchGuides(dto: SearchGuidesDto): Promise<PaginatedGuidesResponse> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = this.buildSearchWhere(dto);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.guideProfile.findMany({
        where,
        include: {
          user: true,
        },
        orderBy: [
          { isAvailable: 'desc' },
          { ratingAvg: 'desc' },
          { hourlyRate: 'asc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.guideProfile.count({ where }),
    ]);

    return {
      items: items.map(mapGuideProfileResponse),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPublicGuide(id: string): Promise<GuideProfileResponse> {
    const profile = await this.prisma.guideProfile.findFirst({
      where: {
        id,
        deletedAt: null,
        verificationStatus: GuideVerificationStatus.APPROVED,
      },
      include: {
        user: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Guide profile not found');
    }

    return mapGuideProfileResponse(profile);
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

  private buildSearchWhere(dto: SearchGuidesDto): Prisma.GuideProfileWhereInput {
    const and: Prisma.GuideProfileWhereInput[] = [
      {
        deletedAt: null,
        verificationStatus: GuideVerificationStatus.APPROVED,
      },
    ];

    if (dto.onlyAvailable) {
      and.push({ isAvailable: true });
    }

    if (dto.city) {
      const term = dto.city.trim();
      const slug = this.slugify(term);

      and.push({
        OR: [
          { city: { contains: term, mode: 'insensitive' } },
          {
            cityCatalog: {
              OR: [
                { slug },
                { name: { contains: term, mode: 'insensitive' } },
              ],
            },
          },
        ],
      });
    }

    if (dto.language) {
      const term = dto.language.trim();

      and.push({
        OR: [
          { languages: { has: term } },
          {
            guideLanguages: {
              some: {
                language: {
                  OR: [
                    { code: term.toLowerCase() },
                    { name: { contains: term, mode: 'insensitive' } },
                  ],
                },
              },
            },
          },
        ],
      });
    }

    if (dto.specialty) {
      const term = dto.specialty.trim();
      const slug = this.slugify(term);

      and.push({
        OR: [
          { specialties: { has: term } },
          {
            guideSpecialties: {
              some: {
                specialty: {
                  OR: [
                    { slug },
                    { name: { contains: term, mode: 'insensitive' } },
                  ],
                },
              },
            },
          },
        ],
      });
    }

    if (dto.minRating !== undefined) {
      and.push({ ratingAvg: { gte: toDecimal(dto.minRating) } });
    }

    if (dto.maxHourlyRate !== undefined) {
      and.push({ hourlyRate: { lte: toDecimal(dto.maxHourlyRate) } });
    }

    return { AND: and };
  }

  private async findCity(city: string) {
    const term = city.trim();

    return this.prisma.city.findFirst({
      where: {
        isActive: true,
        OR: [
          { id: term },
          { slug: this.slugify(term) },
          { name: { equals: term, mode: 'insensitive' } },
        ],
      },
    });
  }

  private async findLanguageIds(languages: string[]): Promise<string[]> {
    if (!languages.length) {
      return [];
    }

    const values = languages.map((language) => language.trim());
    const catalogLanguages = await this.prisma.language.findMany({
      where: {
        isActive: true,
        OR: values.flatMap((value) => [
          { id: value },
          { code: value.toLowerCase() },
          { name: { equals: value, mode: 'insensitive' as const } },
        ]),
      },
      select: { id: true },
    });

    return catalogLanguages.map((language) => language.id);
  }

  private async findSpecialtyIds(specialties: string[]): Promise<string[]> {
    if (!specialties.length) {
      return [];
    }

    const values = specialties.map((specialty) => specialty.trim());
    const catalogSpecialties = await this.prisma.specialty.findMany({
      where: {
        isActive: true,
        OR: values.flatMap((value) => [
          { id: value },
          { slug: this.slugify(value) },
          { name: { equals: value, mode: 'insensitive' as const } },
        ]),
      },
      select: { id: true },
    });

    return catalogSpecialties.map((specialty) => specialty.id);
  }

  private slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
