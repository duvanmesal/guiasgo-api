import { CertificationStatus, GuideCertification } from '@prisma/client';

export interface GuideCertificationResponse {
  id: string;
  guideId: string;
  type: string;
  documentUrl: string;
  status: string;
  issuedBy: string;
  issuedAt: string;
  reviewedById: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export function mapGuideCertificationResponse(
  certification: GuideCertification,
): GuideCertificationResponse {
  return {
    id: certification.id,
    guideId: certification.guideId,
    type: certification.type,
    documentUrl: certification.documentUrl,
    status: certification.status.toLowerCase(),
    issuedBy: certification.issuedBy,
    issuedAt: certification.issuedAt.toISOString(),
    reviewedById: certification.reviewedById,
    reviewedAt: certification.reviewedAt?.toISOString() ?? null,
    rejectionReason: certification.rejectionReason,
    createdAt: certification.createdAt.toISOString(),
    updatedAt: certification.updatedAt.toISOString(),
  };
}

export function toDbCertificationStatus(status: string): CertificationStatus {
  return status.toUpperCase() as CertificationStatus;
}
