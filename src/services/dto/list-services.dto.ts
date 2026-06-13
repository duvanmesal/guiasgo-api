import { IsIn, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { API_SERVICE_STATUSES } from '../service-status.mapper';
import type { ApiServiceStatus } from '../service-status.mapper';

export class ListServicesDto {
  @IsOptional()
  @IsIn(API_SERVICE_STATUSES)
  status?: ApiServiceStatus;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
