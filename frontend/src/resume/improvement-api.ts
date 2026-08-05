import { apiRequest } from '../lib/api'

export interface ImprovementContext {
  jobDescription?: string
}

export function improveSummary(token: string, resumeId: string, currentSummary: string, context: ImprovementContext) {
  return apiRequest<{ summary: string; changes: string[] }>(`/resumes/${resumeId}/improvements/summary`, { method: 'POST', body: JSON.stringify({ currentSummary, ...context }) }, token)
}

export function rewriteExperience(token: string, resumeId: string, input: { position: string; company: string; accomplishments: string[] } & ImprovementContext) {
  return apiRequest<{ bullets: string[]; guidance: string }>(`/resumes/${resumeId}/improvements/experience`, { method: 'POST', body: JSON.stringify(input) }, token)
}

export function suggestSkills(token: string, resumeId: string, currentSkills: string[], context: ImprovementContext) {
  return apiRequest<{ skills: string[]; missingSkills: string[]; rationale: string }>(`/resumes/${resumeId}/improvements/skills`, { method: 'POST', body: JSON.stringify({ currentSkills, ...context }) }, token)
}

export function reviewAts(token: string, resumeId: string, context: ImprovementContext) {
  return apiRequest<{ estimatedScore: number; keywords: string[]; recommendations: string[] }>(`/resumes/${resumeId}/improvements/ats`, { method: 'POST', body: JSON.stringify(context) }, token)
}

export function improveDescription(token: string, resumeId: string, input: { type: 'experience' | 'project'; title: string; organization?: string; currentDescription: string } & ImprovementContext) {
  return apiRequest<{ description: string; improvements: string[] }>(`/resumes/${resumeId}/improvements/description`, { method: 'POST', body: JSON.stringify(input) }, token)
}
