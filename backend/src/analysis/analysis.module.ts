import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { PdfTextService } from './pdf-text.service';

@Module({
  imports: [AiModule],
  controllers: [AnalysisController],
  providers: [AnalysisService, PdfTextService],
})
export class AnalysisModule {}
