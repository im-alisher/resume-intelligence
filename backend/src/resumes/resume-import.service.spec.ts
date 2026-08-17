import { PdfTextService } from '../analysis/pdf-text.service';
import { AiService } from '../ai/ai.service';
import { ResumeImportService } from './resume-import.service';

describe('ResumeImportService', () => {
  it('extracts, cleans, and structures an uploaded resume without persisting it', async () => {
    const pdfTextService = {
      extract: jest.fn().mockResolvedValue('Jane Doe  \r\n\r\n\r\nEngineer'),
    } as unknown as PdfTextService;
    const structured = {
      title: 'Jane Doe Resume',
      personalInfo: {
        fullName: 'Jane Doe',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
      },
      summary: '',
      skills: [],
      experiences: [],
      education: [],
      projects: [],
      certifications: [],
      customSections: [],
    };
    const aiService = {
      generateStructured: jest.fn().mockResolvedValue(structured),
    } as unknown as AiService;
    const service = new ResumeImportService(pdfTextService, aiService);

    await expect(service.import({} as Express.Multer.File)).resolves.toEqual(
      structured,
    );
    expect(pdfTextService.extract).toHaveBeenCalled();
    expect(aiService.generateStructured).toHaveBeenCalledWith(
      expect.anything(),
      'resume_import',
      expect.any(String),
      '<RESUME>\nJane Doe\n\nEngineer\n</RESUME>',
      6000,
    );
  });
});
