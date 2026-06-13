import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const COMPLAINT_STATUSES = ['open', 'in_review', 'resolved'] as const;
export type ApiComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export class UpdateComplaintDto {
  @IsIn(COMPLAINT_STATUSES)
  status!: ApiComplaintStatus;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  assignedToId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  resolutionNotes?: string;
}
