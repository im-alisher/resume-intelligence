import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { AiService } from '../ai/ai.service';
import type { ResumeAnalysisResult } from '../ai/resume-analysis.schema';
import { PrismaService } from '../database/prisma.service';
import { PdfTextService } from './pdf-text.service';

@Injectable()
export class AnalysisService {
  constructor(
    private readonly pdfTextService: PdfTextService,
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {}

  async analyze(
    file: Express.Multer.File,
    jobDescription?: string,
  ): Promise<ResumeAnalysisResult> {
    const resumeText = await this.pdfTextService.extract(file);
    const result = await this.aiService.analyzeResume(
      resumeText,
      jobDescription,
    );

    await this.prisma.resumeAnalysis.create({
      data: {
        sourceFileName: file.originalname.slice(0, 255),
        jobDescription,
        overallScore: result.overallScore,
        atsScore: result.atsScore,
        result: result as Prisma.InputJsonValue,
      },
    });

    return result;
  }
}
