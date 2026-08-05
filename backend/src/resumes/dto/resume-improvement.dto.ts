import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class JobContextDto {
  @IsOptional()
  @IsString()
  @MaxLength(12_000)
  jobDescription?: string;
}

export class ImproveSummaryDto extends JobContextDto {
  @IsString()
  @MaxLength(2_500)
  currentSummary!: string;
}

export class RewriteExperienceDto extends JobContextDto {
  @IsString()
  @MaxLength(160)
  position!: string;

  @IsString()
  @MaxLength(160)
  company!: string;

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  accomplishments!: string[];
}

export class SuggestSkillsDto extends JobContextDto {
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  currentSkills!: string[];
}

export class ImproveDescriptionDto extends JobContextDto {
  @IsIn(['experience', 'project'])
  type!: 'experience' | 'project';

  @IsString()
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  organization?: string;

  @IsString()
  @MaxLength(2_500)
  currentDescription!: string;
}
