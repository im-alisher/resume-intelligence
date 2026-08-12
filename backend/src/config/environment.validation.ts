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

  for (const name of ['RESEND_API_KEY', 'EMAIL_FROM'] as const) {
    if (
      typeof environment[name] !== 'string' ||
      !environment[name].trim()
    ) {
      errors.push(`${name} is required`);
    }
  }

  const passwordResetExpiryMinutes = Number(
    environment.PASSWORD_RESET_EXPIRY_MINUTES,
  );
  if (
    !Number.isInteger(passwordResetExpiryMinutes) ||
    passwordResetExpiryMinutes < 1 ||
    passwordResetExpiryMinutes > 1_440
  ) {
    errors.push(
      'PASSWORD_RESET_EXPIRY_MINUTES must be an integer between 1 and 1440',
    );
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

  return {
    ...environment,
    PORT: port,
    PASSWORD_RESET_EXPIRY_MINUTES: passwordResetExpiryMinutes,
  };
}

function isUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
