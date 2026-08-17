import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { ResumesService } from './resumes.service';

interface PersonalInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
}

@Injectable()
export class ResumePdfService {
  constructor(private readonly resumesService: ResumesService) {}

  async generate(userId: string, resumeId: string): Promise<Buffer> {
    const resume = await this.resumesService.get(userId, resumeId);
    const info = asPersonalInfo(resume.personalInfo);
    const document = new PDFDocument({
      size: 'A4',
      margins: { top: 42, right: 48, bottom: 42, left: 48 },
      info: {
        Title: resume.title,
        Author: info.fullName || 'Resume Intelligence user',
        Creator: 'Resume Intelligence',
      },
    });
    const chunks: Buffer[] = [];
    document.on('data', (chunk: Buffer) => chunks.push(chunk));
    const completed = new Promise<Buffer>((resolve, reject) => {
      document.on('end', () => resolve(Buffer.concat(chunks)));
      document.on('error', reject);
    });

    document
      .font('Helvetica-Bold')
      .fontSize(24)
      .fillColor('#0f172a')
      .text(info.fullName || 'Your Name', { align: 'center' });
    const contact = [info.email, info.phone, info.location]
      .filter(Boolean)
      .join('  •  ');
    if (contact) {
      document
        .moveDown(0.35)
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#475569')
        .text(contact, { align: 'center' });
    }
    const links = [info.website, info.linkedin].filter(Boolean).join('  •  ');
    if (links) {
      document.moveDown(0.2).fontSize(8).text(links, { align: 'center' });
    }
    document.moveDown(0.8).strokeColor('#1e293b').lineWidth(1.5);
    document
      .moveTo(48, document.y)
      .lineTo(document.page.width - 48, document.y)
      .stroke();

    if (resume.summary) {
      this.section(document, 'Professional Summary');
      this.body(document, resume.summary);
    }
    if (resume.skills.length) {
      this.section(document, 'Skills');
      this.body(document, resume.skills.join('  •  '));
    }
    if (resume.experiences.length) {
      this.section(document, 'Experience');
      for (const item of resume.experiences) {
        this.ensureSpace(document, 62);
        this.headingRow(
          document,
          item.position || 'Position',
          `${formatDate(item.startDate)} – ${item.isCurrent ? 'Present' : formatDate(item.endDate)}`,
        );
        this.subheading(
          document,
          [item.company, item.location].filter(Boolean).join(', '),
        );
        for (const accomplishment of item.accomplishments) {
          document
            .font('Helvetica')
            .fontSize(9)
            .fillColor('#334155')
            .text(`•  ${accomplishment}`, { indent: 8, paragraphGap: 2 });
        }
        document.moveDown(0.45);
      }
    }
    if (resume.education.length) {
      this.section(document, 'Education');
      for (const item of resume.education) {
        this.ensureSpace(document, 52);
        this.headingRow(
          document,
          [item.degree, item.field].filter(Boolean).join(' in ') || 'Degree',
          [formatDate(item.startDate), formatDate(item.endDate)]
            .filter(Boolean)
            .join(' – '),
        );
        this.subheading(
          document,
          [item.institution, item.location].filter(Boolean).join(', '),
        );
        if (item.description) this.body(document, item.description);
        document.moveDown(0.35);
      }
    }
    if (resume.projects.length) {
      this.section(document, 'Projects');
      for (const item of resume.projects) {
        this.ensureSpace(document, 52);
        this.headingRow(document, item.name || 'Project', '');
        if (item.technologies.length)
          this.subheading(document, item.technologies.join(', '));
        this.body(document, item.description);
        document.moveDown(0.35);
      }
    }
    if (resume.certifications.length) {
      this.section(document, 'Certifications');
      for (const item of resume.certifications) {
        this.ensureSpace(document, 34);
        this.headingRow(
          document,
          item.name || 'Certification',
          formatDate(item.issueDate),
        );
        this.subheading(document, item.issuingOrg);
        document.moveDown(0.25);
      }
    }
    for (const section of asCustomSections(resume.customSections)) {
      if (!section.title || !section.items.length) continue;
      this.section(document, section.title);
      for (const item of section.items) {
        document
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#334155')
          .text(`•  ${item}`, { indent: 8, paragraphGap: 2 });
      }
    }

    document.end();
    return completed;
  }

  private section(document: PDFKit.PDFDocument, title: string): void {
    this.ensureSpace(document, 45);
    document
      .moveDown(0.9)
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#0f172a')
      .text(title.toUpperCase(), { characterSpacing: 1.2 });
    document.moveDown(0.2).strokeColor('#cbd5e1').lineWidth(0.6);
    document
      .moveTo(48, document.y)
      .lineTo(document.page.width - 48, document.y)
      .stroke();
    document.moveDown(0.45);
  }

  private headingRow(
    document: PDFKit.PDFDocument,
    title: string,
    date: string,
  ): void {
    const y = document.y;
    document
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#0f172a')
      .text(title, 48, y, { width: 340 });
    if (date)
      document
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#64748b')
        .text(date, 390, y + 1, {
          width: document.page.width - 438,
          align: 'right',
        });
    document.y = Math.max(document.y, y + 14);
  }

  private subheading(document: PDFKit.PDFDocument, text: string): void {
    if (text)
      document
        .font('Helvetica-Oblique')
        .fontSize(9)
        .fillColor('#475569')
        .text(text);
  }

  private body(document: PDFKit.PDFDocument, text: string): void {
    document
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#334155')
      .text(text, { lineGap: 2 });
  }

  private ensureSpace(document: PDFKit.PDFDocument, height: number): void {
    if (
      document.y + height >
      document.page.height - document.page.margins.bottom
    )
      document.addPage();
  }
}

function asPersonalInfo(value: unknown): PersonalInfo {
  return typeof value === 'object' && value !== null ? value : {};
}

function formatDate(value: Date | null): string {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(value);
}

function asCustomSections(
  value: unknown,
): Array<{ title: string; items: string[] }> {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (section): section is { title: string; items: string[] } =>
      typeof section === 'object' &&
      section !== null &&
      'title' in section &&
      typeof section.title === 'string' &&
      'items' in section &&
      Array.isArray(section.items) &&
      section.items.every((item) => typeof item === 'string'),
  );
}
