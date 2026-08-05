import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AnalyzeResumeDto {
  @IsOptional()
  @IsString()
  @MaxLength(12_000)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  jobDescription?: string;
}
