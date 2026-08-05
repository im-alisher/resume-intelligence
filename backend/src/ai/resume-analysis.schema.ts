import { z } from 'zod';

const scoreSchema = z.number().int().min(0).max(100);

export const resumeAnalysisSchema = z.object({
  overallScore: scoreSchema,
  atsScore: scoreSchema,
  skills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  experienceAnalysis: z.object({
    summary: z.string(),
    impact: z.string(),
    relevance: z.string(),
    progression: z.string(),
  }),
  improvementSuggestions: z.array(
    z.object({
      priority: z.enum(['high', 'medium', 'low']),
      category: z.string(),
      suggestion: z.string(),
    }),
  ),
});

export type ResumeAnalysisResult = z.infer<typeof resumeAnalysisSchema>;
