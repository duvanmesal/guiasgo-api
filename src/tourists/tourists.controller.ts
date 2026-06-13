import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateTouristProfileDto } from './dto/create-tourist-profile.dto';
import { UpdateTouristProfileDto } from './dto/update-tourist-profile.dto';
import { TouristProfileResponse } from './tourist-profile.response';
import { TouristsService } from './tourists.service';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';

@UseGuards(JwtAuthGuard)
@Controller('tourists')
export class TouristsController {
  constructor(private readonly touristsService: TouristsService) {}

  @Post('profile')
  createProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTouristProfileDto,
  ): Promise<TouristProfileResponse> {
    return this.touristsService.createProfile(user.id, dto);
  }

  @Get('me')
  getMyProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TouristProfileResponse> {
    return this.touristsService.getMyProfile(user.id);
  }

  @Patch('me')
  updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateTouristProfileDto,
  ): Promise<TouristProfileResponse> {
    return this.touristsService.updateMyProfile(user.id, dto);
  }
}
