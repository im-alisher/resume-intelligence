import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const detail =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const message = this.message(detail, status);
    const requestId = request.headers['x-request-id'];

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.originalUrl} failed`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status] ?? 'Error',
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
      ...(typeof requestId === 'string' ? { requestId } : {}),
    });
  }

  private message(detail: string | object | undefined, status: number) {
    if (typeof detail === 'string') return detail;
    if (detail && 'message' in detail) {
      const message = detail.message;
      if (typeof message === 'string' || Array.isArray(message)) return message;
    }
    return status >= 500 ? 'Internal server error' : 'Request failed';
  }
}
