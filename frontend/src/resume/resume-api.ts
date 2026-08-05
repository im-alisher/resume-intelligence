import { API_URL, ApiError, apiRequest } from '../lib/api'
import type { Resume, ResumeForm, ResumeListItem } from './resume-types'

export const resumeKeys = {
  all: ['resumes'] as const,
  detail: (id: string) => ['resumes', id] as const,
}

export function listResumes(token: string) {
  return apiRequest<ResumeListItem[]>('/resumes', {}, token)
}

export function getResume(token: string, id: string) {
  return apiRequest<ApiResume>(`/resumes/${id}`, {}, token).then(fromApiResume)
}

export function createResume(token: string, input: ResumeForm) {
  return apiRequest<ApiResume>(
    '/resumes',
    { method: 'POST', body: JSON.stringify(toApiResume(input)) },
    token,
  ).then(fromApiResume)
}

export function updateResume(token: string, id: string, input: ResumeForm) {
  return apiRequest<ApiResume>(
    `/resumes/${id}`,
    { method: 'PUT', body: JSON.stringify(toApiResume(input)) },
    token,
  ).then(fromApiResume)
}

export function deleteResume(token: string, id: string) {
  return apiRequest<void>(`/resumes/${id}`, { method: 'DELETE' }, token)
}

export async function downloadResumePdf(
  token: string,
  id: string,
  title: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/resumes/${id}/export/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string }
    throw new ApiError(body.message ?? 'Unable to export this resume', response.status)
  }
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${safeFileName(title) || 'resume'}.pdf`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

type ApiResume = Omit<Resume, 'experiences' | 'education' | 'certifications'> & {
  experiences: Array<Omit<Resume['experiences'][number], 'startDate' | 'endDate'> & { startDate: string; endDate?: string | null }>
  education: Array<Omit<Resume['education'][number], 'startDate' | 'endDate'> & { startDate?: string | null; endDate?: string | null }>
  certifications: Array<Omit<Resume['certifications'][number], 'issueDate' | 'expirationDate'> & { issueDate?: string | null; expirationDate?: string | null }>
}

function toApiResume(input: ResumeForm) {
  const cleanOptional = (value?: string) => value?.trim() || undefined
  return {
    ...input,
    title: input.title.trim() || 'Untitled Resume',
    summary: cleanOptional(input.summary),
    personalInfo: {
      ...input.personalInfo,
      website: cleanOptional(input.personalInfo.website),
      linkedin: cleanOptional(input.personalInfo.linkedin),
    },
    experiences: input.experiences.map((item) => ({
      ...item,
      location: cleanOptional(item.location),
      startDate: toApiDate(item.startDate),
      endDate: item.isCurrent ? undefined : toApiDate(item.endDate),
    })),
    education: input.education.map((item) => ({
      ...item,
      field: cleanOptional(item.field),
      location: cleanOptional(item.location),
      description: cleanOptional(item.description),
      startDate: toApiDate(item.startDate),
      endDate: toApiDate(item.endDate),
    })),
    projects: input.projects.map((item) => ({
      ...item,
      url: cleanOptional(item.url),
    })),
    certifications: input.certifications.map((item) => ({
      ...item,
      credentialUrl: cleanOptional(item.credentialUrl),
      issueDate: toApiDate(item.issueDate),
      expirationDate: toApiDate(item.expirationDate),
    })),
  }
}

function fromApiResume(resume: ApiResume): Resume {
  return {
    ...resume,
    summary: resume.summary ?? '',
    experiences: resume.experiences.map((item) => ({
      ...item,
      location: item.location ?? '',
      startDate: toMonth(item.startDate),
      endDate: toMonth(item.endDate),
    })),
    education: resume.education.map((item) => ({
      ...item,
      field: item.field ?? '',
      location: item.location ?? '',
      description: item.description ?? '',
      startDate: toMonth(item.startDate),
      endDate: toMonth(item.endDate),
    })),
    projects: resume.projects.map((item) => ({ ...item, url: item.url ?? '' })),
    certifications: resume.certifications.map((item) => ({
      ...item,
      credentialUrl: item.credentialUrl ?? '',
      issueDate: toMonth(item.issueDate),
      expirationDate: toMonth(item.expirationDate),
    })),
  }
}

function toApiDate(value?: string): string | undefined {
  return value ? `${value}-01T00:00:00.000Z` : undefined
}

function toMonth(value?: string | null): string {
  return value ? value.slice(0, 7) : ''
}

function safeFileName(value: string): string {
  return value.trim().replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}
