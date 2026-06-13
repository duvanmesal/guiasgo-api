import { Injectable, NotFoundException } from '@nestjs/common';
import { ComplaintStatus, ServiceStatus } from '@prisma/client';
import { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { ServicesService } from '../services/services.service';
import { ComplaintResponse, mapComplaintResponse, toDbComplaintStatus } from './complaint.response';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';

@Injectable()
export class ComplaintsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly servicesService: ServicesService,
  ) {}

  async createComplaint(
    serviceId: string,
    user: AuthenticatedUser,
    dto: CreateComplaintDto,
  ): Promise<ComplaintResponse> {
    const serviceRequest = await this.servicesService.findAuthorizedService(
      serviceId,
      user,
    );

    const complaint = await this.prisma.complaint.create({
      data: {
        serviceRequestId: serviceRequest.id,
        createdById: user.id,
        reason: dto.reason.trim(),
        description: dto.description.trim(),
      },
    });

    await this.prisma.serviceRequest.update({
      where: { id: serviceRequest.id },
      data: {
        status: ServiceStatus.REPORTED,
      },
    });

    return mapComplaintResponse(complaint);
  }

  async listComplaints(status?: string): Promise<ComplaintResponse[]> {
    const complaints = await this.prisma.complaint.findMany({
      where: {
        status: status ? toDbComplaintStatus(status) : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });

    return complaints.map(mapComplaintResponse);
  }

  async updateComplaint(
    id: string,
    dto: UpdateComplaintDto,
  ): Promise<ComplaintResponse> {
    const current = await this.prisma.complaint.findUnique({ where: { id } });

    if (!current) {
      throw new NotFoundException('Complaint not found');
    }

    const status = toDbComplaintStatus(dto.status);
    const complaint = await this.prisma.complaint.update({
      where: { id },
      data: {
        status,
        assignedToId: dto.assignedToId,
        resolutionNotes: dto.resolutionNotes?.trim(),
        resolvedAt: status === ComplaintStatus.RESOLVED ? new Date() : null,
      },
    });

    return mapComplaintResponse(complaint);
  }
}
