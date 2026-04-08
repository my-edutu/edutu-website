/**
 * Environment Configuration
 * Validates required environment variables at runtime
 */

export interface AppConfig {
  clerkPublishableKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiBaseUrl: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

class EnvironmentError extends Error {
  constructor(variable: string) {
    super(`Missing required environment variable: ${variable}`);
    this.name = 'EnvironmentError';
  }
}

function getRequiredEnv(variable: string): string {
  const value = process.env[variable];
  if (!value) {
    throw new EnvironmentError(variable);
  }
  return value;
}

function getOptionalEnv(variable: string, fallback: string = ''): string {
  return process.env[variable] || fallback;
}

export function validateEnvironment(): AppConfig {
  try {
    const clerkPublishableKey = getRequiredEnv('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
    const supabaseUrl = getRequiredEnv('EXPO_PUBLIC_SUPABASE_URL');
    const supabaseAnonKey = getRequiredEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');
    const apiBaseUrl = getOptionalEnv('EXPO_PUBLIC_API_URL', 'http://localhost:3000');
    
    const isProduction = process.env.NODE_ENV === 'production';
    const isDevelopment = !isProduction;

    return {
      clerkPublishableKey,
      supabaseUrl,
      supabaseAnonKey,
      apiBaseUrl,
      isProduction,
      isDevelopment,
    };
  } catch (error) {
    if (error instanceof EnvironmentError) {
      console.error(`[ENV] ${error.message}`);
    }
    throw error;
  }
}

export const config = validateEnvironment();

export default config;