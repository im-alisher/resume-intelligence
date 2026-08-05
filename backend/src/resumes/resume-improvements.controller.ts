import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import {
  ImproveDescriptionDto,
  ImproveSummaryDto,
  JobContextDto,
  RewriteExperienceDto,
  SuggestSkillsDto,
} from './dto/resume-improvement.dto';
import { ResumeImprovementsService } from './resume-improvements.service';

@Controller('resumes/:id/improvements')
@UseGuards(JwtAuthGuard)
export class ResumeImprovementsController {
  constructor(private readonly improvements: ResumeImprovementsService) {}

  @Post('summary')
  improveSummary(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: ImproveSummaryDto,
  ) {
    return this.improvements.improveSummary(user.id, id, input);
  }

  @Post('experience')
  rewriteExperience(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: RewriteExperienceDto,
  ) {
    return this.improvements.rewriteExperience(user.id, id, input);
  }

  @Post('skills')
  suggestSkills(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: SuggestSkillsDto,
  ) {
    return this.improvements.suggestSkills(user.id, id, input);
  }

  @Post('ats')
  reviewAts(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: JobContextDto,
  ) {
    return this.improvements.reviewAts(user.id, id, input);
  }

  @Post('description')
  improveDescription(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: ImproveDescriptionDto,
  ) {
    return this.improvements.improveDescription(user.id, id, input);
  }
}
