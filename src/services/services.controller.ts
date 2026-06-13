import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CancelServiceDto } from './dto/cancel-service.dto';
import { CompleteServiceDto } from './dto/complete-service.dto';
import { ListServicesDto } from './dto/list-services.dto';
import { RejectServiceDto } from './dto/reject-service.dto';
import { RequestServiceDto } from './dto/request-service.dto';
import { ServiceRequestResponse } from './service.response';
import { PaginatedServicesResponse, ServicesService } from './services.service';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Roles(UserRole.TOURIST)
  @Post('request')
  requestService(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RequestServiceDto,
  ): Promise<ServiceRequestResponse> {
    return this.servicesService.requestService(user, dto);
  }

  @Roles(UserRole.TOURIST, UserRole.GUIDE, UserRole.ADMIN, UserRole.SUPPORT)
  @Get('me')
  listMyServices(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListServicesDto,
  ): Promise<PaginatedServicesResponse> {
    return this.servicesService.listMyServices(user, query);
  }

  @Roles(UserRole.TOURIST, UserRole.GUIDE, UserRole.ADMIN, UserRole.SUPPORT)
  @Get(':id')
  getService(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ServiceRequestResponse> {
    return this.servicesService.getService(id, user);
  }

  @Roles(UserRole.GUIDE)
  @Patch(':id/accept')
  accept(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ServiceRequestResponse> {
    return this.servicesService.accept(id, user);
  }

  @Roles(UserRole.GUIDE)
  @Patch(':id/reject')
  reject(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: RejectServiceDto,
  ): Promise<ServiceRequestResponse> {
    return this.servicesService.reject(id, user, dto);
  }

  @Roles(UserRole.GUIDE)
  @Patch(':id/on-way')
  markGuideOnWay(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ServiceRequestResponse> {
    return this.servicesService.markGuideOnWay(id, user);
  }

  @Roles(UserRole.GUIDE)
  @Patch(':id/meeting-point')
  markMeetingPoint(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ServiceRequestResponse> {
    return this.servicesService.markMeetingPoint(id, user);
  }

  @Roles(UserRole.GUIDE)
  @Patch(':id/start')
  start(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ServiceRequestResponse> {
    return this.servicesService.start(id, user);
  }

  @Roles(UserRole.GUIDE)
  @Patch(':id/complete')
  complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CompleteServiceDto,
  ): Promise<ServiceRequestResponse> {
    return this.servicesService.complete(id, user, dto);
  }

  @Roles(UserRole.TOURIST, UserRole.GUIDE)
  @Patch(':id/cancel')
  cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CancelServiceDto,
  ): Promise<ServiceRequestResponse> {
    return this.servicesService.cancel(id, user, dto);
  }
}
