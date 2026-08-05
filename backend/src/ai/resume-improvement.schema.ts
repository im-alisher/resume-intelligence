import { z } from 'zod';

export const summaryImprovementSchema = z.object({
  summary: z.string(),
  changes: z.array(z.string()),
});

export const experienceImprovementSchema = z.object({
  bullets: z.array(z.string()),
  guidance: z.string(),
});

export const skillSuggestionSchema = z.object({
  skills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  rationale: z.string(),
});

export const atsImprovementSchema = z.object({
  estimatedScore: z.number().int().min(0).max(100),
  keywords: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export const descriptionImprovementSchema = z.object({
  description: z.string(),
  improvements: z.array(z.string()),
});
