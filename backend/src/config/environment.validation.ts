const REQUIRED_URLS = ['DATABASE_URL', 'FRONTEND_URL'] as const;

export function validateEnvironment(
  environment: Record<string, unknown>,
): Record<string, unknown> {
  const errors: string[] = [];

  for (const name of REQUIRED_URLS) {
    const value = environment[name];
    if (typeof value !== 'string' || !isUrl(value)) {
      errors.push(`${name} must be a valid URL`);
    }
  }

  const jwtSecret = environment.JWT_SECRET;
  if (typeof jwtSecret !== 'string' || jwtSecret.length < 32) {
    errors.push('JWT_SECRET must contain at least 32 characters');
  }

  if (
    typeof environment.GROQ_API_KEY !== 'string' ||
    !environment.GROQ_API_KEY.trim()
  ) {
    errors.push('GROQ_API_KEY is required');
  }

  const port = Number(environment.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    errors.push('PORT must be an integer between 1 and 65535');
  }

  if (errors.length) {
    throw new Error(
      `Invalid environment configuration:\n- ${errors.join('\n- ')}`,
    );
  }

  return { ...environment, PORT: port };
}

function isUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
