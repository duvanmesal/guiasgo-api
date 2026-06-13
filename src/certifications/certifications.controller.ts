import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { GuideCertificationResponse } from './certification.response';
import { CertificationsService } from './certifications.service';
import { CreateGuideCertificationDto } from './dto/create-guide-certification.dto';
import { ReviewGuideCertificationDto } from './dto/review-guide-certification.dto';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';

@Controller()
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('guides/certifications')
  createForCurrentGuide(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateGuideCertificationDto,
  ): Promise<GuideCertificationResponse> {
    return this.certificationsService.createForCurrentGuide(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('guides/certifications/me')
  listForCurrentGuide(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GuideCertificationResponse[]> {
    return this.certificationsService.listForCurrentGuide(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('certifications/:id/review')
  reviewCertification(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ReviewGuideCertificationDto,
  ): Promise<GuideCertificationResponse> {
    return this.certificationsService.reviewCertification(id, user.id, dto);
  }
}
