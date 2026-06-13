import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponse } from './review.response';
import { ReviewsService } from './reviews.service';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('services/:serviceId/review')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Roles(UserRole.TOURIST)
  @Post()
  createReview(
    @Param('serviceId') serviceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponse> {
    return this.reviewsService.createReview(serviceId, user, dto);
  }
}
