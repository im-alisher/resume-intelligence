export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  website?: string
  linkedin?: string
}

export interface ExperienceItem {
  company: string
  position: string
  location?: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  accomplishments: string[]
}

export interface EducationItem {
  institution: string
  degree: string
  field?: string
  location?: string
  startDate?: string
  endDate?: string
  description?: string
}

export interface ProjectItem {
  name: string
  description: string
  url?: string
  technologies: string[]
}

export interface CertificationItem {
  name: string
  issuingOrg: string
  issueDate?: string
  expirationDate?: string
  credentialUrl?: string
}

export interface CustomSection {
  id: string
  title: string
  items: string[]
  order: number
}

export interface ResumeForm {
  title: string
  personalInfo: PersonalInfo
  summary: string
  skills: string[]
  experiences: ExperienceItem[]
  education: EducationItem[]
  projects: ProjectItem[]
  certifications: CertificationItem[]
  customSections: CustomSection[]
}

export interface Resume extends ResumeForm {
  id: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
}

export interface ResumeListItem {
  id: string
  title: string
  status: Resume['status']
  createdAt: string
  updatedAt: string
}
