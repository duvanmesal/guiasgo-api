import { IsString, MaxLength, MinLength, IsOptional } from 'class-validator';

export class CancelServiceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  reason!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
