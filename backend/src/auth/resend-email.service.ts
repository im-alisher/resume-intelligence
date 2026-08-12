import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class ResendEmailService {
  private readonly resend: Resend;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(
      this.configService.getOrThrow<string>('RESEND_API_KEY'),
    );
    this.from = this.configService.getOrThrow<string>('EMAIL_FROM');
  }

  async sendPasswordReset(
    email: string,
    token: string,
    expiryMinutes: number,
  ): Promise<void> {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const resetUrl = new URL('/reset-password', frontendUrl);
    resetUrl.searchParams.set('token', token);

    const { error } = await this.resend.emails.send({
      from: this.from,
      to: email,
      subject: 'Reset your Resume Intelligence password',
      text: `Reset your password using this link: ${resetUrl.toString()}\n\nThis link expires in ${expiryMinutes} minutes. If you did not request it, you can ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a"><h1 style="font-size:24px">Reset your password</h1><p>We received a request to reset your Resume Intelligence password.</p><p><a href="${resetUrl.toString()}" style="display:inline-block;padding:12px 20px;background:#22d3ee;color:#082f49;text-decoration:none;border-radius:8px;font-weight:700">Choose a new password</a></p><p style="color:#64748b;font-size:14px">This link expires in ${expiryMinutes} minutes. If you did not request it, you can ignore this email.</p></div>`,
    });

    if (error) {
      throw new InternalServerErrorException(
        'Unable to send password reset email',
      );
    }
  }
}
