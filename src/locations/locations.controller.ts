import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationResponse } from './location.response';
import { LocationsService } from './locations.service';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMyLocation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateLocationDto,
  ): Promise<LocationResponse> {
    return this.locationsService.updateMyLocation(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyLocation(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LocationResponse> {
    return this.locationsService.getMyLocation(user.id);
  }

  @Get('guides/:guideId')
  getGuideLocation(@Param('guideId') guideId: string): Promise<LocationResponse> {
    return this.locationsService.getGuideLocation(guideId);
  }
}
