import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateComplaintDto } from '../complaints/dto/update-complaint.dto';
import { UpdateGuideVerificationDto } from '../guides/dto/update-guide-verification.dto';
import {
  AdminCertificationResponse,
  AdminComplaintResponse,
  AdminGuideResponse,
  AdminListResponse,
  AdminSummaryResponse,
  AdminUserResponse,
} from './admin.response';
import { AdminService } from './admin.service';
import { ListAdminDto } from './dto/list-admin.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @Get('summary')
  getSummary(): Promise<AdminSummaryResponse> {
    return this.adminService.getSummary();
  }

  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @Get('users')
  listUsers(
    @Query() query: ListAdminDto,
  ): Promise<AdminListResponse<AdminUserResponse>> {
    return this.adminService.listUsers(query);
  }

  @Roles(UserRole.ADMIN)
  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ): Promise<AdminUserResponse> {
    return this.adminService.updateUserStatus(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @Get('guides/pending')
  listPendingGuides(
    @Query() query: ListAdminDto,
  ): Promise<AdminListResponse<AdminGuideResponse>> {
    return this.adminService.listPendingGuides(query);
  }

  @Roles(UserRole.ADMIN)
  @Patch('guides/:id/verification')
  updateGuideVerification(
    @Param('id') id: string,
    @Body() dto: UpdateGuideVerificationDto,
  ): Promise<AdminGuideResponse> {
    return this.adminService.updateGuideVerification(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @Get('certifications/pending')
  listPendingCertifications(
    @Query() query: ListAdminDto,
  ): Promise<AdminListResponse<AdminCertificationResponse>> {
    return this.adminService.listPendingCertifications(query);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @Get('complaints')
  listComplaints(
    @Query() query: ListAdminDto,
  ): Promise<AdminListResponse<AdminComplaintResponse>> {
    return this.adminService.listComplaints(query);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @Patch('complaints/:id')
  updateComplaint(
    @Param('id') id: string,
    @Body() dto: UpdateComplaintDto,
  ): Promise<AdminComplaintResponse> {
    return this.adminService.updateComplaint(id, dto);
  }
}
