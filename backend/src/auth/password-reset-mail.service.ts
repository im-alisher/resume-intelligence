import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class PasswordResetMailService {
  private readonly logger = new Logger(PasswordResetMailService.name);
  private readonly transporter: Transporter | null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    this.transporter = host && user && pass
      ? nodemailer.createTransport({
          host,
          port: Number(this.configService.get('SMTP_PORT') ?? 587),
          secure: this.configService.get('SMTP_SECURE') === 'true',
          auth: { user, pass },
        })
      : null;
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const resetUrl = new URL('/reset-password', frontendUrl);
    resetUrl.searchParams.set('token', token);

    if (!this.transporter) {
      if (this.configService.get('NODE_ENV') === 'production') {
        throw new Error('SMTP configuration is required in production');
      }
      this.logger.log(`Development password reset URL for ${email}: ${resetUrl.toString()}`);
      return;
    }

    const from = this.configService.get<string>('EMAIL_FROM') ?? this.configService.getOrThrow<string>('SMTP_USER');
    await this.transporter.sendMail({
      from,
      to: email,
      subject: 'Reset your Resume Intelligence password',
      text: `Reset your password using this link: ${resetUrl.toString()}\n\nThis link expires in 30 minutes. If you did not request it, you can ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a"><h1 style="font-size:24px">Reset your password</h1><p>We received a request to reset your Resume Intelligence password.</p><p><a href="${resetUrl.toString()}" style="display:inline-block;padding:12px 20px;background:#22d3ee;color:#082f49;text-decoration:none;border-radius:8px;font-weight:700">Choose a new password</a></p><p style="color:#64748b;font-size:14px">This link expires in 30 minutes. If you did not request it, you can ignore this email.</p></div>`,
    });
  }
}
