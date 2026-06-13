import {
  IsArray,
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateGuideProfileDto {
  @IsString()
  @MinLength(20)
  @MaxLength(1200)
  bio!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  city!: string;

  @IsArray()
  @IsString({ each: true })
  @MinLength(2, { each: true })
  @MaxLength(80, { each: true })
  languages!: string[];

  @IsArray()
  @IsString({ each: true })
  @MinLength(2, { each: true })
  @MaxLength(80, { each: true })
  specialties!: string[];

  @IsNumber()
  @Min(0)
  @Max(99999999)
  hourlyRate!: number;

  @IsOptional()
  @IsBoolean()
  supportsHourly?: boolean;

  @IsOptional()
  @IsBoolean()
  supportsRoute?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  yearsExperience?: number;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;
}
