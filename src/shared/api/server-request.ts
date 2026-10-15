import 'server-only';

interface ServerApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code?: string } | null;
}

export class ServerApiError extends Error {
  constructor(
    readonly status: number,
    readonly code?: string,
  ) {
    super(`API 요청에 실패했습니다. (${status})`);
    this.name = 'ServerApiError';
  }
}

export const getApiOnServer = async <T>(path: string, accessToken: string): Promise<T> => {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('API_BASE_URL 환경변수가 설정되지 않았습니다.');
  }

  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}${path}`, {
    headers: { Cookie: `accessToken=${accessToken}` },
    cache: 'no-store',
  });
  const result = (await response.json().catch(() => null)) as ServerApiResponse<T> | null;

  if (!response.ok || !result?.success || !result.data) {
    throw new ServerApiError(response.status, result?.error?.code);
  }

  return result.data;
};
