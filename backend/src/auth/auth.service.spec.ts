import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

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
    authService = new AuthService(usersService, jwtService);
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
});
