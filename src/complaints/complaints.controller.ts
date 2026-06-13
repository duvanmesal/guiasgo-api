import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ComplaintResponse } from './complaint.response';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Roles(UserRole.TOURIST, UserRole.GUIDE)
  @Post('services/:serviceId/complaint')
  createComplaint(
    @Param('serviceId') serviceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateComplaintDto,
  ): Promise<ComplaintResponse> {
    return this.complaintsService.createComplaint(serviceId, user, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @Get('complaints')
  listComplaints(@Query('status') status?: string): Promise<ComplaintResponse[]> {
    return this.complaintsService.listComplaints(status);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @Patch('complaints/:id')
  updateComplaint(
    @Param('id') id: string,
    @Body() dto: UpdateComplaintDto,
  ): Promise<ComplaintResponse> {
    return this.complaintsService.updateComplaint(id, dto);
  }
}
