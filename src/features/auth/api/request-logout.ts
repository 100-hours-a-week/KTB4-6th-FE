import axios from 'axios';

interface LogoutRouteResponse {
  success: boolean;
  error?: string;
}

export const requestLogout = async (): Promise<void> => {
  try {
    // apiClient는 baseURL이 백엔드라 Next Route Handler에 닿지 않아 일반 Axios로 호출
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
