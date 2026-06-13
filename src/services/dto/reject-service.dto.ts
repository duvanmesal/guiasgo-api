import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectServiceDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
