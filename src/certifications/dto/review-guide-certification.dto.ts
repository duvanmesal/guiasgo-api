import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const CERTIFICATION_REVIEW_STATUSES = ['approved', 'rejected'] as const;

export type ApiCertificationReviewStatus =
  (typeof CERTIFICATION_REVIEW_STATUSES)[number];

export class ReviewGuideCertificationDto {
  @IsIn(CERTIFICATION_REVIEW_STATUSES)
  status!: ApiCertificationReviewStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
