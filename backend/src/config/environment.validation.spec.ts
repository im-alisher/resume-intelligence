import { validateEnvironment } from './environment.validation';

const validEnvironment = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/resumes',
  FRONTEND_URL: 'http://localhost:5173',
  JWT_SECRET: 'a-production-secret-with-32-characters',
  GROQ_API_KEY: 'test-provider-key',
  PORT: '3000',
};

describe('validateEnvironment', () => {
  it('normalizes a valid port', () => {
    expect(validateEnvironment(validEnvironment)).toEqual(
      expect.objectContaining({ PORT: 3000 }),
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
