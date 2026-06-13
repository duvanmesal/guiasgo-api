import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, ServiceStatus, UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { ServicesService } from '../services/services.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { mapReviewResponse, ReviewResponse } from './review.response';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly servicesService: ServicesService,
  ) {}

  async createReview(
    serviceId: string,
    user: AuthenticatedUser,
    dto: CreateReviewDto,
  ): Promise<ReviewResponse> {
    const serviceRequest = await this.servicesService.findAuthorizedService(
      serviceId,
      user,
    );

    if (user.activeRole !== UserRole.TOURIST || serviceRequest.touristId !== user.id) {
      throw new ForbiddenException('Only the tourist can review this service');
    }

    if (serviceRequest.status !== ServiceStatus.COMPLETED) {
      throw new ConflictException('Only completed services can be reviewed');
    }

    try {
      const review = await this.prisma.review.create({
        data: {
          serviceRequestId: serviceRequest.id,
          reviewerId: user.id,
          reviewedUserId: serviceRequest.guide.userId,
          rating: dto.rating,
          comment: dto.comment?.trim(),
        },
      });

      await this.recalculateGuideRating(serviceRequest.guideId);

      return mapReviewResponse(review);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Service already has a review from this user');
      }

      throw error;
    }
  }

  private async recalculateGuideRating(guideId: string): Promise<void> {
    const guide = await this.prisma.guideProfile.findUnique({
      where: { id: guideId },
      select: { userId: true },
    });

    if (!guide) {
      return;
    }

    const aggregate = await this.prisma.review.aggregate({
      where: {
        reviewedUserId: guide.userId,
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    await this.prisma.guideProfile.update({
      where: { id: guideId },
      data: {
        ratingAvg: new Prisma.Decimal(aggregate._avg.rating ?? 0),
        reviewCount: aggregate._count.rating,
      },
    });
  }
}
