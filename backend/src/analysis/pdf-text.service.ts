import { BadRequestException, Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

const PDF_SIGNATURE = '%PDF-';
const MAX_EXTRACTED_CHARACTERS = 50_000;

@Injectable()
export class PdfTextService {
  async extract(file: Express.Multer.File): Promise<string> {
    if (!file.buffer.subarray(0, 5).equals(Buffer.from(PDF_SIGNATURE))) {
      throw new BadRequestException('The uploaded file is not a valid PDF');
    }

    const parser = new PDFParse({ data: file.buffer });
    try {
      const result = await parser.getText();
      const text = result.text.replace(/\u0000/g, '').trim();
      if (text.length < 50) {
        throw new BadRequestException(
          'No readable text was found. Please upload a text-based PDF.',
        );
      }
      return text.slice(0, MAX_EXTRACTED_CHARACTERS);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Unable to read the uploaded PDF');
    } finally {
      await parser.destroy();
    }
  }
}
