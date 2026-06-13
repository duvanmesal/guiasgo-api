import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateGuideProfileDto } from './dto/create-guide-profile.dto';
import { UpdateGuideProfileDto } from './dto/update-guide-profile.dto';
import { UpdateGuideVerificationDto } from './dto/update-guide-verification.dto';
import { GuideProfileResponse } from './guide-profile.response';
import { GuidesService } from './guides.service';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';

@Controller('guides')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  createProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateGuideProfileDto,
  ): Promise<GuideProfileResponse> {
    return this.guidesService.createProfile(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GuideProfileResponse> {
    return this.guidesService.getMyProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateGuideProfileDto,
  ): Promise<GuideProfileResponse> {
    return this.guidesService.updateMyProfile(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/verification')
  updateVerificationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateGuideVerificationDto,
  ): Promise<GuideProfileResponse> {
    return this.guidesService.updateVerificationStatus(id, dto);
  }
}
