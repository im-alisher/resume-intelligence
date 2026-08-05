import { ResumesService } from './resumes.service';
import { ResumePdfService } from './resume-pdf.service';

describe('ResumePdfService', () => {
  it('generates a valid PDF after loading an owned resume', async () => {
    const resumesService = {
      get: jest.fn().mockResolvedValue({
        title: 'Engineer Resume',
        personalInfo: {
          fullName: 'Test Engineer',
          email: 'engineer@example.com',
          phone: '+1 555 0100',
          location: 'Remote',
        },
        summary: 'An engineer focused on reliable applications.',
        skills: ['TypeScript', 'NestJS'],
        experiences: [
          {
            position: 'Engineer',
            company: 'Example Co',
            location: 'Remote',
            startDate: new Date('2024-01-01T00:00:00.000Z'),
            endDate: null,
            isCurrent: true,
            accomplishments: ['Improved delivery speed by 30%'],
          },
        ],
        education: [],
        projects: [],
        certifications: [],
      }),
    } as unknown as ResumesService;
    const service = new ResumePdfService(resumesService);

    const result = await service.generate('user-id', 'resume-id');

    expect(result.subarray(0, 5).toString()).toBe('%PDF-');
    expect(result.length).toBeGreaterThan(500);
    expect(resumesService.get).toHaveBeenCalledWith('user-id', 'resume-id');
  });
});
