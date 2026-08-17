import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AnalysisModule } from '../analysis/analysis.module';
import { ResumeImportService } from './resume-import.service';
import { ResumeImprovementsController } from './resume-improvements.controller';
import { ResumeImprovementsService } from './resume-improvements.service';
import { ResumePdfService } from './resume-pdf.service';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';

@Module({
  imports: [AiModule, AnalysisModule],
  controllers: [ResumesController, ResumeImprovementsController],
  providers: [
    ResumesService,
    ResumeImprovementsService,
    ResumePdfService,
    ResumeImportService,
  ],
})
export class ResumesModule {}
