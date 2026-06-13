import { IsIn, IsLatitude, IsLongitude, IsNumber, IsOptional, Max, Min } from 'class-validator';

export const LOCATION_SOURCES = ['mock', 'gps'] as const;
export type ApiLocationSource = (typeof LOCATION_SOURCES)[number];

export class UpdateLocationDto {
  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  accuracy?: number;

  @IsOptional()
  @IsIn(LOCATION_SOURCES)
  source?: ApiLocationSource;
}
