import {
  ConflictException,
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { ResendEmailService } from './resend-email.service';

type PublicUser = Awaited<ReturnType<UsersService['create']>>;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly resendEmailService: ResendEmailService,
    private readonly configService: ConfigService,
  ) {}

  async register(input: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    let user: PublicUser;
    try {
      user = await this.usersService.create({
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
      });
    } catch (error) {
      if (isPrismaErrorWithCode(error, 'P2002')) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }
      throw error;
    }

    return this.createAuthResponse(user);
  }

  async login(input: LoginDto) {
    const user = await this.usersService.findByEmail(input.email);
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createAuthResponse(user);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      const token = randomBytes(32).toString('hex');
      const tokenHash = hashResetToken(token);
      const expiryMinutes = Number(
        this.configService.getOrThrow('PASSWORD_RESET_EXPIRY_MINUTES'),
      );
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      await this.prisma.$transaction([
        this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
        this.prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } }),
      ]);
      try {
        await this.resendEmailService.sendPasswordReset(
          user.email,
          token,
          expiryMinutes,
        );
      } catch (error) {
        this.logger.error(
          `Password reset email delivery failed for user ${user.id}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    return { message: 'If an account exists for that email, a password reset link has been sent.' };
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = hashResetToken(token);
    const resetToken = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
      throw new BadRequestException('This password reset link is invalid or has expired');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const usedAt = new Date();
    await this.prisma.$transaction(async (transaction) => {
      const claimed = await transaction.passwordResetToken.updateMany({
        where: { id: resetToken.id, usedAt: null, expiresAt: { gt: usedAt } },
        data: { usedAt },
      });
      if (claimed.count !== 1) {
        throw new BadRequestException('This password reset link is invalid or has expired');
      }
      await transaction.user.update({ where: { id: resetToken.userId }, data: { passwordHash } });
      await transaction.passwordResetToken.updateMany({
        where: { userId: resetToken.userId, usedAt: null },
        data: { usedAt },
      });
    });

    return { message: 'Your password has been reset successfully.' };
  }

  private async createAuthResponse(user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    createdAt: Date;
  }) {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
    };
  }
}

function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function isPrismaErrorWithCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === code
  );
}
