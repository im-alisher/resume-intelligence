import { BadRequestException } from '@nestjs/common';
import { PdfTextService } from './pdf-text.service';

describe('PdfTextService', () => {
  it('rejects a file whose contents do not have a PDF signature', async () => {
    const service = new PdfTextService();
    const file = {
      buffer: Buffer.from('not a PDF'),
    } as Express.Multer.File;

    await expect(service.extract(file)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
