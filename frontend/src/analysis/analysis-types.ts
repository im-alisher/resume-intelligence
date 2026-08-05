export interface ResumeAnalysisResult {
  overallScore: number
  atsScore: number
  skills: string[]
  missingSkills: string[]
  strengths: string[]
  weaknesses: string[]
  experienceAnalysis: {
    summary: string
    impact: string
    relevance: string
    progression: string
  }
  improvementSuggestions: Array<{
    priority: 'high' | 'medium' | 'low'
    category: string
    suggestion: string
  }>
}
