import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CompleteServiceDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  routeSummary?: string;
}
