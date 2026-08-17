import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ResumesService } from './resumes.service';

describe('ResumesService', () => {
  it('always scopes resume lists to the authenticated user', async () => {
    const prisma = {
      resume: { findMany: jest.fn().mockResolvedValue([]) },
    } as unknown as PrismaService;
    const service = new ResumesService(prisma);

    await service.list('user-id');

    expect(prisma.resume.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-id' } }),
    );
  });

  it('stores custom sections in their submitted order', async () => {
    const create = jest.fn().mockResolvedValue({});
    const prisma = { resume: { create } } as unknown as PrismaService;
    const service = new ResumesService(prisma);
    const input = {
      title: 'Resume',
      summary: '',
      skills: [],
      personalInfo: {
        fullName: 'Jane',
        email: 'jane@example.com',
        phone: '',
        location: '',
      },
      experiences: [],
      education: [],
      projects: [],
      certifications: [],
      customSections: [
        { id: 'awards', title: ' Awards ', items: [' First ', ''], order: 9 },
      ],
    };

    await service.create('user-id', input);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          customSections: [
            { id: 'awards', title: 'Awards', items: ['First'], order: 0 },
          ],
        }),
      }),
    );
  });

  it('does not reveal a resume that is not owned by the user', async () => {
    const prisma = {
      resume: { findFirst: jest.fn().mockResolvedValue(null) },
    } as unknown as PrismaService;
    const service = new ResumesService(prisma);

    await expect(service.get('user-id', 'resume-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
