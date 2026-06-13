import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  GuideVerificationStatus,
  Prisma,
  ServicePricingMode,
  ServiceStatus,
  UserRole,
} from '@prisma/client';
import { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CancelServiceDto } from './dto/cancel-service.dto';
import { CompleteServiceDto } from './dto/complete-service.dto';
import { ListServicesDto } from './dto/list-services.dto';
import { RejectServiceDto } from './dto/reject-service.dto';
import { RequestServiceDto } from './dto/request-service.dto';
import {
  mapServiceRequestResponse,
  ServiceRequestResponse,
} from './service.response';
import { ServiceStateMachine } from './service-state-machine';
import { toDbPricingMode, toDbServiceStatus } from './service-status.mapper';

export interface PaginatedServicesResponse {
  items: ServiceRequestResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const SERVICE_INCLUDE = {
  guide: {
    include: {
      user: true,
    },
  },
  tourSession: true,
} satisfies Prisma.ServiceRequestInclude;

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stateMachine: ServiceStateMachine,
  ) {}

  async requestService(
    user: AuthenticatedUser,
    dto: RequestServiceDto,
  ): Promise<ServiceRequestResponse> {
    const guide = await this.prisma.guideProfile.findFirst({
      where: {
        id: dto.guideId,
        deletedAt: null,
      },
      include: {
        cityCatalog: true,
      },
    });

    if (!guide) {
      throw new NotFoundException('Guide profile not found');
    }

    if (guide.verificationStatus !== GuideVerificationStatus.APPROVED) {
      throw new ForbiddenException('Guide is not verified');
    }

    if (!guide.isAvailable) {
      throw new ConflictException('Guide is not available');
    }

    const touristProfile = await this.prisma.touristProfile.findFirst({
      where: {
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!touristProfile) {
      throw new ForbiddenException('Tourist profile is required');
    }

    const pricingMode = toDbPricingMode(dto.pricingMode ?? 'hourly');
    const estimatedDurationHours = dto.estimatedDurationHours ?? 2;
    const estimatedPrice = this.calculateEstimatedPrice(
      pricingMode,
      Number(guide.hourlyRate),
      estimatedDurationHours,
      dto.estimatedPrice,
    );
    const serviceRequest = await this.prisma.serviceRequest.create({
      data: {
        touristId: user.id,
        guideId: guide.id,
        cityId: guide.cityId,
        city: guide.cityCatalog?.name ?? guide.city,
        meetingPoint: dto.meetingPoint.trim(),
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : new Date(),
        pricingMode,
        estimatedDurationHours:
          pricingMode === ServicePricingMode.HOURLY
            ? new Prisma.Decimal(estimatedDurationHours)
            : undefined,
        routeTitle:
          pricingMode === ServicePricingMode.ROUTE ? dto.routeTitle?.trim() : null,
        estimatedPrice: new Prisma.Decimal(estimatedPrice),
        notes: dto.notes?.trim(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
      include: SERVICE_INCLUDE,
    });

    return mapServiceRequestResponse(serviceRequest);
  }

  async listMyServices(
    user: AuthenticatedUser,
    dto: ListServicesDto,
  ): Promise<PaginatedServicesResponse> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = await this.buildMyServicesWhere(user, dto);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where,
        include: SERVICE_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.serviceRequest.count({ where }),
    ]);

    return {
      items: items.map(mapServiceRequestResponse),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getService(
    id: string,
    user: AuthenticatedUser,
  ): Promise<ServiceRequestResponse> {
    const serviceRequest = await this.findServiceForUser(id, user);
    return mapServiceRequestResponse(serviceRequest);
  }

  findAuthorizedService(id: string, user: AuthenticatedUser) {
    return this.findServiceForUser(id, user);
  }

  accept(id: string, user: AuthenticatedUser): Promise<ServiceRequestResponse> {
    return this.transitionGuideService(id, user, ServiceStatus.ACCEPTED, {
      acceptedAt: new Date(),
    });
  }

  reject(
    id: string,
    user: AuthenticatedUser,
    dto: RejectServiceDto,
  ): Promise<ServiceRequestResponse> {
    return this.transitionGuideService(id, user, ServiceStatus.REJECTED_BY_GUIDE, {
      rejectedAt: new Date(),
      rejectionReason: dto.reason?.trim(),
    });
  }

  markGuideOnWay(
    id: string,
    user: AuthenticatedUser,
  ): Promise<ServiceRequestResponse> {
    return this.transitionGuideService(id, user, ServiceStatus.GUIDE_ON_WAY);
  }

  markMeetingPoint(
    id: string,
    user: AuthenticatedUser,
  ): Promise<ServiceRequestResponse> {
    return this.transitionGuideService(id, user, ServiceStatus.MEETING_POINT);
  }

  async start(
    id: string,
    user: AuthenticatedUser,
  ): Promise<ServiceRequestResponse> {
    const serviceRequest = await this.transitionGuideService(
      id,
      user,
      ServiceStatus.IN_PROGRESS,
    );

    await this.prisma.tourSession.upsert({
      where: { serviceRequestId: id },
      create: {
        serviceRequestId: id,
        startedAt: new Date(),
        status: ServiceStatus.IN_PROGRESS,
      },
      update: {
        startedAt: new Date(),
        status: ServiceStatus.IN_PROGRESS,
      },
    });

    return this.getService(id, user);
  }

  async complete(
    id: string,
    user: AuthenticatedUser,
    dto: CompleteServiceDto,
  ): Promise<ServiceRequestResponse> {
    await this.transitionGuideService(id, user, ServiceStatus.COMPLETED, {
      completedAt: new Date(),
    });

    await this.prisma.tourSession.upsert({
      where: { serviceRequestId: id },
      create: {
        serviceRequestId: id,
        startedAt: new Date(),
        endedAt: new Date(),
        status: ServiceStatus.COMPLETED,
        routeSummary: dto.routeSummary?.trim(),
      },
      update: {
        endedAt: new Date(),
        status: ServiceStatus.COMPLETED,
        routeSummary: dto.routeSummary?.trim(),
      },
    });

    return this.getService(id, user);
  }

  async cancel(
    id: string,
    user: AuthenticatedUser,
    dto: CancelServiceDto,
  ): Promise<ServiceRequestResponse> {
    const serviceRequest = await this.findServiceForUser(id, user);
    const isTouristOwner = serviceRequest.touristId === user.id;
    const isGuideOwner = serviceRequest.guide.userId === user.id;

    if (user.activeRole === UserRole.TOURIST && !isTouristOwner) {
      throw new ForbiddenException('Only the tourist can cancel as tourist');
    }

    if (user.activeRole === UserRole.GUIDE && !isGuideOwner) {
      throw new ForbiddenException('Only the guide can cancel as guide');
    }

    if (
      !([UserRole.TOURIST, UserRole.GUIDE] as UserRole[]).includes(
        user.activeRole,
      )
    ) {
      throw new ForbiddenException('Only tourist or guide can cancel service');
    }

    const nextStatus =
      user.activeRole === UserRole.TOURIST
        ? ServiceStatus.CANCELLED_BY_TOURIST
        : ServiceStatus.CANCELLED_BY_GUIDE;

    this.stateMachine.assertTransition(
      serviceRequest.status,
      nextStatus,
      user.activeRole,
    );

    const updated = await this.prisma.serviceRequest.update({
      where: { id },
      data: {
        status: nextStatus,
        cancelledAt: new Date(),
        cancellationReason: dto.reason.trim(),
        cancellationNotes: dto.notes?.trim(),
      },
      include: SERVICE_INCLUDE,
    });

    return mapServiceRequestResponse(updated);
  }

  private async transitionGuideService(
    id: string,
    user: AuthenticatedUser,
    nextStatus: ServiceStatus,
    data: Prisma.ServiceRequestUpdateInput = {},
  ): Promise<ServiceRequestResponse> {
    const serviceRequest = await this.findServiceForUser(id, user);

    if (serviceRequest.guide.userId !== user.id) {
      throw new ForbiddenException('Only the assigned guide can update service');
    }

    this.stateMachine.assertTransition(
      serviceRequest.status,
      nextStatus,
      UserRole.GUIDE,
    );

    const updated = await this.prisma.serviceRequest.update({
      where: { id },
      data: {
        ...data,
        status: nextStatus,
      },
      include: SERVICE_INCLUDE,
    });

    return mapServiceRequestResponse(updated);
  }

  private async findServiceForUser(id: string, user: AuthenticatedUser) {
    let serviceRequest = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: SERVICE_INCLUDE,
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found');
    }

    if (
      serviceRequest.status === ServiceStatus.REQUESTED &&
      serviceRequest.expiresAt <= new Date()
    ) {
      serviceRequest = await this.prisma.serviceRequest.update({
        where: { id },
        data: { status: ServiceStatus.EXPIRED },
        include: SERVICE_INCLUDE,
      });
    }

    const isTourist = serviceRequest.touristId === user.id;
    const isGuide = serviceRequest.guide.userId === user.id;
    const isStaff = ([UserRole.ADMIN, UserRole.SUPPORT] as UserRole[]).includes(
      user.activeRole,
    );

    if (!isTourist && !isGuide && !isStaff) {
      throw new ForbiddenException('You cannot access this service request');
    }

    return serviceRequest;
  }

  private async buildMyServicesWhere(
    user: AuthenticatedUser,
    dto: ListServicesDto,
  ): Promise<Prisma.ServiceRequestWhereInput> {
    const status = dto.status ? toDbServiceStatus(dto.status) : undefined;

    if (user.activeRole === UserRole.GUIDE) {
      const guide = await this.prisma.guideProfile.findFirst({
        where: {
          userId: user.id,
          deletedAt: null,
        },
      });

      if (!guide) {
        return { id: '__no_services__' };
      }

      return {
        guideId: guide.id,
        status,
      };
    }

    if (
      ([UserRole.ADMIN, UserRole.SUPPORT] as UserRole[]).includes(
        user.activeRole,
      )
    ) {
      return { status };
    }

    return {
      touristId: user.id,
      status,
    };
  }

  private calculateEstimatedPrice(
    pricingMode: ServicePricingMode,
    hourlyRate: number,
    estimatedDurationHours: number,
    routeEstimatedPrice?: number,
  ): number {
    if (pricingMode === ServicePricingMode.ROUTE) {
      if (routeEstimatedPrice === undefined) {
        throw new BadRequestException(
          'estimatedPrice is required for route pricing',
        );
      }

      return routeEstimatedPrice;
    }

    return hourlyRate * estimatedDurationHours;
  }
}
