const prefix = process.env.NEXT_PUBLIC_AUTH_COOKIE_PREFIX ?? '';

export const AUTH_COOKIE_NAMES = {
  accessToken: `${prefix}accessToken`,
  accessTokenExpiresAt: `${prefix}accessTokenExpiresAt`,
  refreshToken: `${prefix}refreshToken`,
} as const;
