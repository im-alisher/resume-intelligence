import { validateEnvironment } from './environment.validation';

const validEnvironment = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/resumes',
  FRONTEND_URL: 'http://localhost:5173',
  JWT_SECRET: 'a-production-secret-with-32-characters',
  GROQ_API_KEY: 'test-provider-key',
  RESEND_API_KEY: 're_test-provider-key',
  EMAIL_FROM: 'Resume Intelligence <no-reply@example.com>',
  PASSWORD_RESET_EXPIRY_MINUTES: '30',
  PORT: '3000',
};

describe('validateEnvironment', () => {
  it('normalizes a valid port', () => {
    expect(validateEnvironment(validEnvironment)).toEqual(
      expect.objectContaining({
        PORT: 3000,
        PASSWORD_RESET_EXPIRY_MINUTES: 30,
      }),
    );
  });

  it('rejects an invalid password reset expiry', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        PASSWORD_RESET_EXPIRY_MINUTES: '0',
      }),
    ).toThrow(
      'PASSWORD_RESET_EXPIRY_MINUTES must be an integer between 1 and 1440',
    );
  });

  it('rejects a short JWT secret', () => {
    expect(() =>
      validateEnvironment({ ...validEnvironment, JWT_SECRET: 'short' }),
    ).toThrow('JWT_SECRET must contain at least 32 characters');
  });

  it('reports all invalid required settings', () => {
    expect(() => validateEnvironment({})).toThrow(
      'Invalid environment configuration',
    );
  });
});
