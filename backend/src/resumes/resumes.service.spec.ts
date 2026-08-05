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
