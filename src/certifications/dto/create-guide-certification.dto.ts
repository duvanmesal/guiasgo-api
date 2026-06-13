import {
  IsDateString,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateGuideCertificationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  type!: string;

  @IsUrl({ require_protocol: false })
  @MaxLength(500)
  documentUrl!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  issuedBy!: string;

  @IsDateString()
  issuedAt!: string;
}
