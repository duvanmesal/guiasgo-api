import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CertificationStatus } from '@prisma/client';
import { GuidesService } from '../guides/guides.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  GuideCertificationResponse,
  mapGuideCertificationResponse,
  toDbCertificationStatus,
} from './certification.response';
import { CreateGuideCertificationDto } from './dto/create-guide-certification.dto';
import { ReviewGuideCertificationDto } from './dto/review-guide-certification.dto';

@Injectable()
export class CertificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly guidesService: GuidesService,
  ) {}

  async createForCurrentGuide(
    userId: string,
    dto: CreateGuideCertificationDto,
  ): Promise<GuideCertificationResponse> {
    const guide = await this.guidesService.findProfileByUserId(userId);
    const certification = await this.prisma.guideCertification.create({
      data: {
        guideId: guide.id,
        type: dto.type.trim(),
        documentUrl: dto.documentUrl.trim(),
        issuedBy: dto.issuedBy.trim(),
        issuedAt: new Date(dto.issuedAt),
      },
    });

    await this.prisma.guideProfile.update({
      where: { id: guide.id },
      data: {
        verificationStatus: 'IN_REVIEW',
      },
    });

    return mapGuideCertificationResponse(certification);
  }

  async listForCurrentGuide(
    userId: string,
  ): Promise<GuideCertificationResponse[]> {
    const guide = await this.guidesService.findProfileByUserId(userId);
    const certifications = await this.prisma.guideCertification.findMany({
      where: {
        guideId: guide.id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return certifications.map(mapGuideCertificationResponse);
  }

  async reviewCertification(
    certificationId: string,
    reviewerId: string,
    dto: ReviewGuideCertificationDto,
  ): Promise<GuideCertificationResponse> {
    if (dto.status === 'rejected' && !dto.rejectionReason?.trim()) {
      throw new BadRequestException(
        'rejectionReason is required when rejecting a certification',
      );
    }

    const currentCertification =
      await this.prisma.guideCertification.findFirst({
        where: {
          id: certificationId,
          deletedAt: null,
        },
      });

    if (!currentCertification) {
      throw new NotFoundException('Certification not found');
    }

    const certification = await this.prisma.guideCertification.update({
      where: { id: certificationId },
      data: {
        status: toDbCertificationStatus(dto.status),
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        rejectionReason:
          dto.status === 'rejected' ? dto.rejectionReason?.trim() : null,
      },
    });

    if (certification.status === CertificationStatus.REJECTED) {
      await this.prisma.guideProfile.update({
        where: { id: certification.guideId },
        data: {
          verificationStatus: 'REJECTED',
          isAvailable: false,
        },
      });
    }

    return mapGuideCertificationResponse(certification);
  }
}
