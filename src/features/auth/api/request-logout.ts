import axios from 'axios';

interface LogoutRouteResponse {
  success: boolean;
  error?: string;
}

export const requestLogout = async (): Promise<void> => {
  try {
    const response = await axios.post<LogoutRouteResponse>('/api/auth/logout', undefined, {
      withCredentials: true,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || '로그아웃에 실패했습니다. 다시 시도해 주세요.');
    }
  } catch (error) {
    if (axios.isAxiosError<LogoutRouteResponse>(error)) {
      throw new Error(
        error.response?.data?.error || '로그아웃에 실패했습니다. 다시 시도해 주세요.',
      );
    }

    throw error;
  }
};
