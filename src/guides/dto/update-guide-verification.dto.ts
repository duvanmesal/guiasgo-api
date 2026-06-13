import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const GUIDE_VERIFICATION_STATUSES = [
  'pending',
  'in_review',
  'approved',
  'rejected',
  'suspended',
] as const;

export type ApiGuideVerificationStatus =
  (typeof GUIDE_VERIFICATION_STATUSES)[number];

export class UpdateGuideVerificationDto {
  @IsIn(GUIDE_VERIFICATION_STATUSES)
  status!: ApiGuideVerificationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
