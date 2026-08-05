import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ResumeImprovementsController } from './resume-improvements.controller';
import { ResumeImprovementsService } from './resume-improvements.service';
import { ResumePdfService } from './resume-pdf.service';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';

@Module({
  imports: [AiModule],
  controllers: [ResumesController, ResumeImprovementsController],
  providers: [ResumesService, ResumeImprovementsService, ResumePdfService],
})
export class ResumesModule {}
