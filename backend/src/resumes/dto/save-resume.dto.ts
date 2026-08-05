import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ResumeSectionsDto } from './resume-section.dto';

export class SaveResumeDto extends ResumeSectionsDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2_500)
  summary?: string;

  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  skills!: string[];
}
