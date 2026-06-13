import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationResponse, mapLocationResponse, toDbLocationSource } from './location.response';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateMyLocation(
    userId: string,
    dto: UpdateLocationDto,
  ): Promise<LocationResponse> {
    const location = await this.prisma.locationUpdate.create({
      data: {
        userId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        accuracy: dto.accuracy,
        source: toDbLocationSource(dto.source ?? 'mock'),
      },
    });

    await this.prisma.guideProfile.updateMany({
      where: {
        userId,
        deletedAt: null,
      },
      data: {
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });

    return mapLocationResponse(location);
  }

  async getMyLocation(userId: string): Promise<LocationResponse> {
    return this.getLatestByUserId(userId);
  }

  async getGuideLocation(guideId: string): Promise<LocationResponse> {
    const guide = await this.prisma.guideProfile.findFirst({
      where: {
        id: guideId,
        deletedAt: null,
      },
      select: {
        userId: true,
      },
    });

    if (!guide) {
      throw new NotFoundException('Guide profile not found');
    }

    return this.getLatestByUserId(guide.userId);
  }

  private async getLatestByUserId(userId: string): Promise<LocationResponse> {
    const location = await this.prisma.locationUpdate.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return mapLocationResponse(location);
  }
}
