import axios from 'axios';
import type { BugReportInput } from '../model/types';

interface BugReportRouteResponse {
  success: boolean;
  error?: string;
}

export const sendBugReport = async (input: BugReportInput): Promise<void> => {
  try {
    // apiClient는 baseURL이 백엔드라 Next Route Handler에 닿지 않아 일반 Axios로 호출
    const response = await axios.post<BugReportRouteResponse>('/api/bug-report', {
      ...input,
      pageUrl: window.location.href,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || '버그 제보 전송에 실패했습니다.');
    }
  } catch (error) {
    if (axios.isAxiosError<BugReportRouteResponse>(error)) {
      throw new Error(error.response?.data?.error || '버그 제보 전송에 실패했습니다.');
    }

    throw error;
  }
};
