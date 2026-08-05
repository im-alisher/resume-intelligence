import { AiService } from '../ai/ai.service';
import type { ResumeAnalysisResult } from '../ai/resume-analysis.schema';
import { PrismaService } from '../database/prisma.service';
import { AnalysisService } from './analysis.service';
import { PdfTextService } from './pdf-text.service';

describe('AnalysisService', () => {
  it('extracts, analyzes, and stores only the structured result', async () => {
    const result: ResumeAnalysisResult = {
      overallScore: 78,
      atsScore: 82,
      skills: ['TypeScript'],
      missingSkills: ['Testing'],
      strengths: ['Clear experience'],
      weaknesses: ['Few metrics'],
      experienceAnalysis: {
        summary: 'Relevant experience',
        impact: 'Some impact is shown',
        relevance: 'Relevant to the target role',
        progression: 'Progression is visible',
      },
      improvementSuggestions: [
        {
          priority: 'high',
          category: 'Impact',
          suggestion: 'Add measurable outcomes',
        },
      ],
    };
    const pdfTextService = {
      extract: jest.fn().mockResolvedValue('extracted resume text'),
    } as unknown as PdfTextService;
    const aiService = {
      analyzeResume: jest.fn().mockResolvedValue(result),
    } as unknown as AiService;
    const prisma = {
      resumeAnalysis: {
        create: jest.fn().mockResolvedValue({ id: 'analysis-id' }),
      },
    } as unknown as PrismaService;
    const service = new AnalysisService(pdfTextService, aiService, prisma);
    const file = {
      originalname: 'resume.pdf',
    } as Express.Multer.File;

    await expect(service.analyze(file, 'TypeScript role')).resolves.toEqual(
      result,
    );
    expect(aiService.analyzeResume).toHaveBeenCalledWith(
      'extracted resume text',
      'TypeScript role',
    );
    expect(prisma.resumeAnalysis.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        sourceFileName: 'resume.pdf',
        overallScore: 78,
        atsScore: 82,
        result,
      }),
    });
    expect(prisma.resumeAnalysis.create).not.toHaveBeenCalledWith(
      expect.objectContaining({ resumeText: expect.anything() }),
    );
  });
});
