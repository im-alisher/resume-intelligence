import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { RESUME_ANALYSIS_INSTRUCTIONS } from './resume-analysis.prompt';
import {
  resumeAnalysisSchema,
  type ResumeAnalysisResult,
} from './resume-analysis.schema';

@Injectable()
export class AiService {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: configService.getOrThrow<string>('GROQ_API_KEY'),
      baseURL: 'https://api.groq.com/openai/v1',
    });
    this.model = configService.get<string>('GROQ_MODEL', 'openai/gpt-oss-120b');
  }

  async analyzeResume(
    resumeText: string,
    jobDescription?: string,
  ): Promise<ResumeAnalysisResult> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: RESUME_ANALYSIS_INSTRUCTIONS },
          {
            role: 'user',
            content: this.buildAnalysisInput(resumeText, jobDescription),
          },
        ],
        response_format: zodResponseFormat(
          resumeAnalysisSchema,
          'resume_analysis',
        ),
        max_completion_tokens: 4_000,
      });

      const content = completion.choices[0]?.message.content;
      if (!content) throw new Error('The model returned an empty response');
      return resumeAnalysisSchema.parse(JSON.parse(content));
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new ServiceUnavailableException(
          'The AI analysis provider is temporarily unavailable',
        );
      }
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException(
        'The AI response could not be validated. Please try again.',
      );
    }
  }

  private buildAnalysisInput(
    resumeText: string,
    jobDescription?: string,
  ): string {
    return [
      '<RESUME>',
      resumeText,
      '</RESUME>',
      '<JOB_DESCRIPTION>',
      jobDescription || 'Not provided',
      '</JOB_DESCRIPTION>',
    ].join('\n');
  }
}
