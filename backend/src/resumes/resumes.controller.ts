import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { SaveResumeDto } from './dto/save-resume.dto';
import { ResumePdfService } from './resume-pdf.service';
import { ResumeImportService } from './resume-import.service';
import { ResumesService } from './resumes.service';

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumesController {
  constructor(
    private readonly resumesService: ResumesService,
    private readonly resumePdfService: ResumePdfService,
    private readonly resumeImportService: ResumeImportService,
  ) {}

  @Post('import')
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    }),
  )
  importResume(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.resumeImportService.import(file);
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.resumesService.list(user.id);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.resumesService.get(user.id, id);
  }

  @Get(':id/export/pdf')
  async exportPdf(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() response: Response,
  ): Promise<void> {
    const pdf = await this.resumePdfService.generate(user.id, id);
    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="resume-${id}.pdf"`,
      'Content-Length': String(pdf.length),
    });
    response.end(pdf);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() input: SaveResumeDto) {
    return this.resumesService.create(user.id, input);
  }

  @Put(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: SaveResumeDto,
  ) {
    return this.resumesService.update(user.id, id, input);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.resumesService.delete(user.id, id);
  }
}
