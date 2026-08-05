import {
  BadRequestException,
  Body,
  Controller,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AnalysisService } from './analysis.service';
import { AnalyzeResumeDto } from './dto/analyze-resume.dto';

const MAX_PDF_SIZE = 5 * 1024 * 1024;

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('resume')
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_PDF_SIZE, files: 1 },
      fileFilter: (_request, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          callback(
            new BadRequestException('Only PDF files are supported'),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  analyzeResume(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body() input: AnalyzeResumeDto,
  ) {
    return this.analysisService.analyze(file, input.jobDescription);
  }
}
