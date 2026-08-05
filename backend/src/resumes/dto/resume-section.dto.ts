import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class PersonalInfoDto {
  @IsString()
  @MaxLength(120)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(40)
  phone!: string;

  @IsString()
  @MaxLength(160)
  location!: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  website?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  linkedin?: string;
}

export class ExperienceDto {
  @IsString()
  @MaxLength(120)
  company!: string;

  @IsString()
  @MaxLength(120)
  position!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsBoolean()
  isCurrent!: boolean;

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  accomplishments!: string[];
}

export class EducationDto {
  @IsString()
  @MaxLength(160)
  institution!: string;

  @IsString()
  @MaxLength(160)
  degree!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  field?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1_000)
  description?: string;
}

export class ProjectDto {
  @IsString()
  @MaxLength(160)
  name!: string;

  @IsString()
  @MaxLength(2_000)
  description!: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  url?: string;

  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  technologies!: string[];
}

export class CertificationDto {
  @IsString()
  @MaxLength(160)
  name!: string;

  @IsString()
  @MaxLength(160)
  issuingOrg!: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  credentialUrl?: string;
}

export class ResumeSectionsDto {
  @ValidateNested()
  @Type(() => PersonalInfoDto)
  personalInfo!: PersonalInfoDto;

  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experiences!: ExperienceDto[];

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  education!: EducationDto[];

  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => ProjectDto)
  projects!: ProjectDto[];

  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => CertificationDto)
  certifications!: CertificationDto[];
}
