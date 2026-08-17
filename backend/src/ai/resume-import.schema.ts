import { z } from 'zod';

const month = z.string().regex(/^(|\d{4}-(0[1-9]|1[0-2]))$/);

export const resumeImportSchema = z.object({
  title: z.string(),
  personalInfo: z.object({
    fullName: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    website: z.string(),
    linkedin: z.string(),
  }),
  summary: z.string(),
  skills: z.array(z.string()),
  experiences: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      location: z.string(),
      startDate: month,
      endDate: month,
      isCurrent: z.boolean(),
      accomplishments: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string(),
      location: z.string(),
      startDate: month,
      endDate: month,
      description: z.string(),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      url: z.string(),
      technologies: z.array(z.string()),
    }),
  ),
  certifications: z.array(
    z.object({
      name: z.string(),
      issuingOrg: z.string(),
      issueDate: month,
      expirationDate: month,
      credentialUrl: z.string(),
    }),
  ),
  customSections: z.array(
    z.object({
      title: z.string(),
      items: z.array(z.string()),
    }),
  ),
});

export type ResumeImportResult = z.infer<typeof resumeImportSchema>;
