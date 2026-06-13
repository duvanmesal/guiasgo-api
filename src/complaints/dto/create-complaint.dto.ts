import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateComplaintDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  reason!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1200)
  description!: string;
}
