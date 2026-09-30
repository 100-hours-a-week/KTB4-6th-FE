import axios from 'axios';

interface WithdrawRouteResponse {
  success: boolean;
  error?: string;
}

export const withdraw = async (): Promise<void> => {
  try {
    // apiClient는 baseURL이 백엔드라 Next Route Handler에 닿지 않아 일반 Axios로 호출
    const response = await axios.post<WithdrawRouteResponse>('/api/auth/withdraw', undefined, {
      withCredentials: true,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || '회원 탈퇴에 실패했습니다. 다시 시도해 주세요.');
    }
  } catch (error) {
    if (axios.isAxiosError<WithdrawRouteResponse>(error)) {
      throw new Error(
        error.response?.data?.error || '회원 탈퇴에 실패했습니다. 다시 시도해 주세요.',
      );
    }

    throw error;
  }
};
