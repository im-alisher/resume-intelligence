import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { RESUME_IMPROVEMENT_INSTRUCTIONS } from '../ai/resume-improvement.prompt';
import {
  atsImprovementSchema,
  descriptionImprovementSchema,
  experienceImprovementSchema,
  skillSuggestionSchema,
  summaryImprovementSchema,
} from '../ai/resume-improvement.schema';
import type {
  ImproveDescriptionDto,
  ImproveSummaryDto,
  JobContextDto,
  RewriteExperienceDto,
  SuggestSkillsDto,
} from './dto/resume-improvement.dto';
import { ResumesService } from './resumes.service';

@Injectable()
export class ResumeImprovementsService {
  constructor(
    private readonly resumesService: ResumesService,
    private readonly aiService: AiService,
  ) {}

  async improveSummary(
    userId: string,
    resumeId: string,
    input: ImproveSummaryDto,
  ) {
    const context = await this.context(userId, resumeId);
    return this.aiService.generateStructured(
      summaryImprovementSchema,
      'summary_improvement',
      `${RESUME_IMPROVEMENT_INSTRUCTIONS}\nWrite a compelling 2-4 sentence professional summary. Return the revised summary and a short list of changes.`,
      this.input(context, input.currentSummary, input.jobDescription),
    );
  }

  async rewriteExperience(
    userId: string,
    resumeId: string,
    input: RewriteExperienceDto,
  ) {
    const context = await this.context(userId, resumeId);
    return this.aiService.generateStructured(
      experienceImprovementSchema,
      'experience_improvement',
      `${RESUME_IMPROVEMENT_INSTRUCTIONS}\nRewrite the experience as concise achievement-oriented bullet points. Preserve all facts and numbers exactly.`,
      this.input(
        context,
        JSON.stringify({
          position: input.position,
          company: input.company,
          accomplishments: input.accomplishments,
        }),
        input.jobDescription,
      ),
    );
  }

  async suggestSkills(
    userId: string,
    resumeId: string,
    input: SuggestSkillsDto,
  ) {
    const context = await this.context(userId, resumeId);
    return this.aiService.generateStructured(
      skillSuggestionSchema,
      'skill_suggestions',
      `${RESUME_IMPROVEMENT_INSTRUCTIONS}\nReturn a deduplicated recommended skills list. Put unsupported job requirements in missingSkills, not skills.`,
      this.input(context, input.currentSkills.join(', '), input.jobDescription),
    );
  }

  async reviewAts(userId: string, resumeId: string, input: JobContextDto) {
    const context = await this.context(userId, resumeId);
    return this.aiService.generateStructured(
      atsImprovementSchema,
      'ats_improvement',
      `${RESUME_IMPROVEMENT_INSTRUCTIONS}\nEstimate ATS readiness and return relevant keywords plus specific recommendations. Do not claim this score guarantees hiring outcomes.`,
      this.input(
        context,
        'Review the complete saved resume.',
        input.jobDescription,
      ),
    );
  }

  async improveDescription(
    userId: string,
    resumeId: string,
    input: ImproveDescriptionDto,
  ) {
    const context = await this.context(userId, resumeId);
    return this.aiService.generateStructured(
      descriptionImprovementSchema,
      'description_improvement',
      `${RESUME_IMPROVEMENT_INSTRUCTIONS}\nCreate one polished description for the supplied ${input.type}. Preserve facts and keep it suitable for a resume.`,
      this.input(context, JSON.stringify(input), input.jobDescription),
    );
  }

  private async context(userId: string, resumeId: string): Promise<string> {
    const resume = await this.resumesService.get(userId, resumeId);
    return JSON.stringify({
      title: resume.title,
      personalInfo: resume.personalInfo,
      summary: resume.summary,
      skills: resume.skills,
      experiences: resume.experiences,
      education: resume.education,
      projects: resume.projects,
      certifications: resume.certifications,
    });
  }

  private input(
    context: string,
    currentContent: string,
    jobDescription?: string,
  ): string {
    return `<RESUME_CONTEXT>\n${context}\n</RESUME_CONTEXT>\n<CURRENT_CONTENT>\n${currentContent}\n</CURRENT_CONTENT>\n<JOB_DESCRIPTION>\n${jobDescription || 'Not provided'}\n</JOB_DESCRIPTION>`;
  }
}
