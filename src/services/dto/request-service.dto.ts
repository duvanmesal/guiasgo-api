import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export const SERVICE_PRICING_MODES = ['hourly', 'route'] as const;
export type ApiServicePricingMode = (typeof SERVICE_PRICING_MODES)[number];

export class RequestServiceDto {
  @IsString()
  @MinLength(1)
  guideId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  meetingPoint!: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsIn(SERVICE_PRICING_MODES)
  pricingMode?: ApiServicePricingMode;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(24)
  estimatedDurationHours?: number;

  @ValidateIf((dto: RequestServiceDto) => dto.pricingMode === 'route')
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  routeTitle?: string;

  @ValidateIf((dto: RequestServiceDto) => dto.pricingMode === 'route')
  @IsNumber()
  @Min(0)
  @Max(99999999)
  estimatedPrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(800)
  notes?: string;
}
