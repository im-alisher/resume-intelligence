import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { SaveResumeDto } from './dto/save-resume.dto';

const resumeInclude = {
  experiences: { orderBy: { sortOrder: 'asc' as const } },
  education: { orderBy: { sortOrder: 'asc' as const } },
  projects: { orderBy: { sortOrder: 'asc' as const } },
  certifications: { orderBy: { sortOrder: 'asc' as const } },
};

@Injectable()
export class ResumesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async get(userId: string, id: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id, userId },
      include: resumeInclude,
    });
    if (!resume) throw new NotFoundException('Resume not found');
    return resume;
  }

  create(userId: string, input: SaveResumeDto) {
    return this.prisma.resume.create({
      data: {
        ...this.resumeData(input),
        user: { connect: { id: userId } },
      },
      include: resumeInclude,
    });
  }

  async update(userId: string, id: string, input: SaveResumeDto) {
    await this.ensureOwned(userId, id);
    return this.prisma.$transaction(async (transaction) => {
      await Promise.all([
        transaction.experience.deleteMany({ where: { resumeId: id } }),
        transaction.education.deleteMany({ where: { resumeId: id } }),
        transaction.project.deleteMany({ where: { resumeId: id } }),
        transaction.certification.deleteMany({ where: { resumeId: id } }),
      ]);
      return transaction.resume.update({
        where: { id },
        data: this.resumeData(input),
        include: resumeInclude,
      });
    });
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.ensureOwned(userId, id);
    await this.prisma.resume.delete({ where: { id } });
  }

  private async ensureOwned(userId: string, id: string): Promise<void> {
    const resume = await this.prisma.resume.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!resume) throw new NotFoundException('Resume not found');
  }

  private resumeData(
    input: SaveResumeDto,
  ): Omit<Prisma.ResumeCreateInput, 'user'> {
    return {
      title: input.title.trim(),
      personalInfo: input.personalInfo as unknown as Prisma.InputJsonValue,
      summary: input.summary?.trim() || null,
      skills: cleanList(input.skills),
      experiences: {
        create: input.experiences.map((item, sortOrder) => ({
          company: item.company.trim(),
          position: item.position.trim(),
          location: item.location?.trim() || null,
          startDate: item.startDate ? new Date(item.startDate) : null,
          endDate: item.endDate ? new Date(item.endDate) : null,
          isCurrent: item.isCurrent,
          accomplishments: cleanList(item.accomplishments),
          sortOrder,
        })),
      },
      education: {
        create: input.education.map((item, sortOrder) => ({
          institution: item.institution.trim(),
          degree: item.degree.trim(),
          field: item.field?.trim() || null,
          location: item.location?.trim() || null,
          startDate: item.startDate ? new Date(item.startDate) : null,
          endDate: item.endDate ? new Date(item.endDate) : null,
          description: item.description?.trim() || null,
          sortOrder,
        })),
      },
      projects: {
        create: input.projects.map((item, sortOrder) => ({
          name: item.name.trim(),
          description: item.description.trim(),
          url: item.url || null,
          technologies: cleanList(item.technologies),
          sortOrder,
        })),
      },
      certifications: {
        create: input.certifications.map((item, sortOrder) => ({
          name: item.name.trim(),
          issuingOrg: item.issuingOrg.trim(),
          issueDate: item.issueDate ? new Date(item.issueDate) : null,
          expirationDate: item.expirationDate
            ? new Date(item.expirationDate)
            : null,
          credentialUrl: item.credentialUrl || null,
          sortOrder,
        })),
      },
    };
  }
}

function cleanList(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}
