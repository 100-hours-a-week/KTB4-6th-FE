import axios from 'axios';
import { apiClient } from '@/shared/api';

interface JoinMeetingResponse {
  success: boolean;
  data: { participationStatus: string } | null;
}

interface JoinMeetingErrorResponse {
  error?: { code?: string };
}

export async function joinMeeting(meetingId: string): Promise<void> {
  try {
    const response = await apiClient.post<JoinMeetingResponse>(
      `/api/v1/meetings/${encodeURIComponent(meetingId)}/participants`,
    );

    if (
      response.status !== 201 ||
      !response.data.success ||
      response.data.data?.participationStatus !== 'JOINED'
    ) {
      throw new Error('회의 입장 응답을 확인할 수 없습니다.');
    }
  } catch (error) {
    if (
      axios.isAxiosError<JoinMeetingErrorResponse>(error) &&
      error.response?.status === 409 &&
      error.response.data?.error?.code === 'ALREADY_PARTICIPATING'
    ) {
      return;
    }

    throw error;
  }
}
