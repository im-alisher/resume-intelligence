import { Injectable } from '@nestjs/common';
import { PdfTextService } from '../analysis/pdf-text.service';
import { AiService } from '../ai/ai.service';
import {
  resumeImportSchema,
  type ResumeImportResult,
} from '../ai/resume-import.schema';

const IMPORT_INSTRUCTIONS = `Convert the supplied resume text into structured resume data.
Return only facts supported by the source. Use empty strings and empty arrays for missing data.
Dates must be YYYY-MM or an empty string. Put content that does not fit a standard section into customSections.
Keep accomplishment bullets concise and do not invent metrics, employers, qualifications, or links.`;

@Injectable()
export class ResumeImportService {
  constructor(
    private readonly pdfTextService: PdfTextService,
    private readonly aiService: AiService,
  ) {}

  async import(file: Express.Multer.File): Promise<ResumeImportResult> {
    const extracted = await this.pdfTextService.extract(file);
    const cleaned = this.clean(extracted);
    const result = await this.aiService.generateStructured(
      resumeImportSchema,
      'resume_import',
      IMPORT_INSTRUCTIONS,
      `<RESUME>\n${cleaned}\n</RESUME>`,
      6_000,
    );
    return resumeImportSchema.parse(result);
  }

  private clean(text: string): string {
    return text
      .replace(/\r\n?/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/[ \t]*\n[ \t]*/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
