const isProd = process.env.NODE_ENV === 'production';

export const RATE_LIMIT = {
  GLOBAL: {
    name: 'default',
    ttl: 60_000,
    limit: isProd ? 300 : 5000,
  },
  AUTH: {
    name: 'auth',
    ttl: 15 * 60_000,
    limit: isProd ? 30 : 500,
  },
  REGISTER: {
    name: 'register',
    ttl: 15 * 60_000,
    limit: isDev ? 100 : 20,
  },
  REFRESH_TOKEN: {
    name: 'refresh-token',
    ttl: 15 * 60_000,
    limit: isDev ? 100 : 30,
  },
  LOGIN: {
    name: 'login',
    ttl: 15 * 60_000,
    limit: isDev ? 100 : 15,
  },
  OTP: {
    name: 'otp',
    ttl: 10 * 60_000,
    limit: isDev ? 50 : 5,
  },
  OTP_RESEND: {
    name: 'otp-resend',
    ttl: 60_000,
    limit: isDev ? 20 : 3,
  },
  PASSWORD_RESET: {
    name: 'password-reset',
    ttl: 60 * 60_000,
    limit: isDev ? 50 : 5,
  },
} as const;
