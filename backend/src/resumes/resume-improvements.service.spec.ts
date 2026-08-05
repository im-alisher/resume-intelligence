import { NotFoundException } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { ResumeImprovementsService } from './resume-improvements.service';
import { ResumesService } from './resumes.service';

describe('ResumeImprovementsService', () => {
  it('checks resume ownership before sending content to the AI provider', async () => {
    const resumesService = {
      get: jest.fn().mockRejectedValue(new NotFoundException()),
    } as unknown as ResumesService;
    const aiService = {
      generateStructured: jest.fn(),
    } as unknown as AiService;
    const service = new ResumeImprovementsService(resumesService, aiService);

    await expect(
      service.improveSummary('user-id', 'resume-id', {
        currentSummary: 'Current summary',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(aiService.generateStructured).not.toHaveBeenCalled();
  });
});
