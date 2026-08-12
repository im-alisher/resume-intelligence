import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { ResendEmailService } from './resend-email.service';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  const user = {
    id: '9b162f19-8670-4df0-b32c-2f21e08abfcb',
    email: 'person@example.com',
    firstName: 'Test',
    lastName: 'Person',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let prisma: jest.Mocked<PrismaService>;
  let resendEmailService: jest.Mocked<ResendEmailService>;
  let configService: jest.Mocked<ConfigService>;
  let authService: AuthService;

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findPublicById: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-token'),
    } as unknown as jest.Mocked<JwtService>;
    prisma = {
      passwordResetToken: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<PrismaService>;
    resendEmailService = {
      sendPasswordReset: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ResendEmailService>;
    configService = {
      getOrThrow: jest.fn().mockReturnValue(30),
    } as unknown as jest.Mocked<ConfigService>;
    authService = new AuthService(
      usersService,
      jwtService,
      prisma,
      resendEmailService,
      configService,
    );
  });

  it('hashes a password and returns a password-safe registration response', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockImplementation(async (data) => ({
      ...user,
      ...data,
    }));

    const result = await authService.register({
      email: user.email,
      password: 'strong-password',
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const createInput = usersService.create.mock.calls[0][0];
    expect(createInput.passwordHash).not.toBe('strong-password');
    expect(
      await bcrypt.compare('strong-password', createInput.passwordHash),
    ).toBe(true);
    expect(result).toEqual({ accessToken: 'signed-token', user });
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('rejects registration for an existing email', async () => {
    usersService.findByEmail.mockResolvedValue({
      ...user,
      passwordHash: 'hash',
      updatedAt: user.createdAt,
    });

    await expect(
      authService.register({ email: user.email, password: 'strong-password' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects invalid login credentials', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({ email: user.email, password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns the same generic forgot-password response for an unknown email', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    const result = await authService.forgotPassword('missing@example.com');

    expect(result).toEqual({
      message:
        'If an account exists for that email, a password reset link has been sent.',
    });
    expect(resendEmailService.sendPasswordReset).not.toHaveBeenCalled();
  });

  it('stores a reset token and sends it through Resend for an existing user', async () => {
    usersService.findByEmail.mockResolvedValue({
      ...user,
      passwordHash: 'hash',
      updatedAt: user.createdAt,
    });

    const result = await authService.forgotPassword(user.email);

    expect(prisma.passwordResetToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: user.id,
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        expiresAt: expect.any(Date),
      }),
    });
    expect(resendEmailService.sendPasswordReset).toHaveBeenCalledWith(
      user.email,
      expect.stringMatching(/^[a-f0-9]{64}$/),
      30,
    );
    expect(result.message).toMatch(/^If an account exists/);
  });
});
