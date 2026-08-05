import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ResumeImprovementsController } from './resume-improvements.controller';
import { ResumeImprovementsService } from './resume-improvements.service';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';

@Module({
  imports: [AiModule],
  controllers: [ResumesController, ResumeImprovementsController],
  providers: [ResumesService, ResumeImprovementsService],
})
export class ResumesModule {}
