const ACCESS_TOKEN_EXPIRES_AT_COOKIE = 'accessTokenExpiresAt';

export const getAccessTokenExpiresAt = (): number | null => {
  const value = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${ACCESS_TOKEN_EXPIRES_AT_COOKIE}=`))
    ?.slice(ACCESS_TOKEN_EXPIRES_AT_COOKIE.length + 1);
  const expiresAt = Number(value);

  return value && Number.isFinite(expiresAt) ? expiresAt : null;
};
