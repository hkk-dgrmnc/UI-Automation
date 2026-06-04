import 'dotenv/config';

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }

  return value;
}

export const env = {
  baseUrl: getRequiredEnv('BASE_URL'),
  runningEnv: process.env.RUNNING_ENV ?? 'test',
} as const;
