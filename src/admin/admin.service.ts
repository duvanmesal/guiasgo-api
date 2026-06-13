import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ComplaintStatus,
  CertificationStatus,
  GuideVerificationStatus,
  ServiceStatus,
  UserStatus,
} from '@prisma/client';
import { mapGuideCertificationResponse } from '../certifications/certification.response';
import { mapComplaintResponse } from '../complaints/complaint.response';
import { UpdateComplaintDto } from '../complaints/dto/update-complaint.dto';
import { GuideProfileResponse, mapGuideProfileResponse } from '../guides/guide-profile.response';
import { UpdateGuideVerificationDto } from '../guides/dto/update-guide-verification.dto';
import { GuidesService } from '../guides/guides.service';
import { PrismaService } from '../prisma/prisma.service';
import { mapUserResponse, userWithRolesInclude } from '../users/user-response';
import {
  AdminCertificationResponse,
  AdminComplaintResponse,
  AdminGuideResponse,
  AdminListResponse,
  AdminSummaryResponse,
  AdminUserResponse,
  buildAdminSummary,
} from './admin.response';
import { ListAdminDto } from './dto/list-admin.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly guidesService: GuidesService,
  ) {}

  async getSummary(): Promise<AdminSummaryResponse> {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalGuides,
      pendingGuides,
      inReviewGuides,
      approvedGuides,
      rejectedGuides,
      totalServices,
      requestedServices,
      inProgressServices,
      completedServices,
      reportedServices,
      cancelledByTourist,
      cancelledByGuide,
      openComplaints,
      inReviewComplaints,
      resolvedComplaints,
    ] = await this.prisma.$transaction([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({
        where: { deletedAt: null, status: UserStatus.ACTIVE },
      }),
      this.prisma.user.count({
        where: { deletedAt: null, status: UserStatus.SUSPENDED },
      }),
      this.prisma.guideProfile.count({ where: { deletedAt: null } }),
      this.prisma.guideProfile.count({
        where: { deletedAt: null, verificationStatus: GuideVerificationStatus.PENDING },
      }),
      this.prisma.guideProfile.count({
        where: { deletedAt: null, verificationStatus: GuideVerificationStatus.IN_REVIEW },
      }),
      this.prisma.guideProfile.count({
        where: { deletedAt: null, verificationStatus: GuideVerificationStatus.APPROVED },
      }),
      this.prisma.guideProfile.count({
        where: { deletedAt: null, verificationStatus: GuideVerificationStatus.REJECTED },
      }),
      this.prisma.serviceRequest.count(),
      this.prisma.serviceRequest.count({
        where: { status: ServiceStatus.REQUESTED },
      }),
      this.prisma.serviceRequest.count({
        where: { status: ServiceStatus.IN_PROGRESS },
      }),
      this.prisma.serviceRequest.count({
        where: { status: ServiceStatus.COMPLETED },
      }),
      this.prisma.serviceRequest.count({
        where: { status: ServiceStatus.REPORTED },
      }),
      this.prisma.serviceRequest.count({
        where: { status: ServiceStatus.CANCELLED_BY_TOURIST },
      }),
      this.prisma.serviceRequest.count({
        where: { status: ServiceStatus.CANCELLED_BY_GUIDE },
      }),
      this.prisma.complaint.count({ where: { status: ComplaintStatus.OPEN } }),
      this.prisma.complaint.count({
        where: { status: ComplaintStatus.IN_REVIEW },
      }),
      this.prisma.complaint.count({
        where: { status: ComplaintStatus.RESOLVED },
      }),
    ]);

    return buildAdminSummary(
      {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
      },
      {
        total: totalGuides,
        pending: pendingGuides,
        inReview: inReviewGuides,
        approved: approvedGuides,
        rejected: rejectedGuides,
      },
      {
        total: totalServices,
        requested: requestedServices,
        inProgress: inProgressServices,
        completed: completedServices,
        reported: reportedServices,
        cancelled: cancelledByTourist + cancelledByGuide,
      },
      {
        open: openComplaints,
        inReview: inReviewComplaints,
        resolved: resolvedComplaints,
      },
    );
  }

  async listUsers(
    dto: ListAdminDto,
  ): Promise<AdminListResponse<AdminUserResponse>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        include: userWithRolesInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);

    return this.paginate(items.map(mapUserResponse), total, page, limit);
  }

  async updateUserStatus(
    userId: string,
    dto: UpdateUserStatusDto,
  ): Promise<AdminUserResponse> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const status = dto.status.toUpperCase() as UserStatus;
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status,
        refreshTokens:
          status === UserStatus.SUSPENDED
            ? {
                updateMany: {
                  where: { revokedAt: null },
                  data: { revokedAt: new Date() },
                },
              }
            : undefined,
      },
      include: userWithRolesInclude,
    });

    if (status === UserStatus.SUSPENDED) {
      await this.prisma.guideProfile.updateMany({
        where: {
          userId,
          deletedAt: null,
        },
        data: {
          isAvailable: false,
        },
      });
    }

    return mapUserResponse(updatedUser);
  }

  async listPendingGuides(
    dto: ListAdminDto,
  ): Promise<AdminListResponse<AdminGuideResponse>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = {
      deletedAt: null,
      verificationStatus: {
        in: [GuideVerificationStatus.PENDING, GuideVerificationStatus.IN_REVIEW],
      },
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.guideProfile.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.guideProfile.count({ where }),
    ]);

    return this.paginate(items.map(mapGuideProfileResponse), total, page, limit);
  }

  updateGuideVerification(
    guideId: string,
    dto: UpdateGuideVerificationDto,
  ): Promise<GuideProfileResponse> {
    return this.guidesService.updateVerificationStatus(guideId, dto);
  }

  async listPendingCertifications(
    dto: ListAdminDto,
  ): Promise<AdminListResponse<AdminCertificationResponse>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = {
      deletedAt: null,
      status: CertificationStatus.PENDING,
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.guideCertification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.guideCertification.count({ where }),
    ]);

    return this.paginate(
      items.map(mapGuideCertificationResponse),
      total,
      page,
      limit,
    );
  }

  async listComplaints(
    dto: ListAdminDto,
  ): Promise<AdminListResponse<AdminComplaintResponse>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.complaint.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.complaint.count(),
    ]);

    return this.paginate(items.map(mapComplaintResponse), total, page, limit);
  }

  async updateComplaint(
    complaintId: string,
    dto: UpdateComplaintDto,
  ): Promise<AdminComplaintResponse> {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    const status = dto.status.toUpperCase() as ComplaintStatus;
    const updatedComplaint = await this.prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status,
        assignedToId: dto.assignedToId,
        resolutionNotes: dto.resolutionNotes?.trim(),
        resolvedAt: status === ComplaintStatus.RESOLVED ? new Date() : null,
      },
    });

    return mapComplaintResponse(updatedComplaint);
  }

  private paginate<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
  ): AdminListResponse<T> {
    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
