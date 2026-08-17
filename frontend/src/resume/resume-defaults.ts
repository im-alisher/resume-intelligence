import type { User } from '../auth/auth-context'
import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  ResumeForm,
} from './resume-types'

export function createBlankResume(user: User): ResumeForm {
  return {
    title: 'Untitled Resume',
    personalInfo: {
      fullName: [user.firstName, user.lastName].filter(Boolean).join(' '),
      email: user.email,
      phone: '',
      location: '',
    },
    summary: '',
    skills: [],
    experiences: [],
    education: [],
    projects: [],
    certifications: [],
    customSections: [],
  }
}

export const blankExperience = (): ExperienceItem => ({
  company: '',
  position: '',
  location: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  accomplishments: [],
})

export const blankEducation = (): EducationItem => ({
  institution: '',
  degree: '',
  field: '',
  location: '',
  startDate: '',
  endDate: '',
  description: '',
})

export const blankProject = (): ProjectItem => ({
  name: '',
  description: '',
  url: '',
  technologies: [],
})

export const blankCertification = (): CertificationItem => ({
  name: '',
  issuingOrg: '',
  issueDate: '',
  expirationDate: '',
  credentialUrl: '',
})
