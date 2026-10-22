import axios from 'axios';
import { apiClient } from '@/shared/api';
import {
  toCurrentMeetingState,
  type ActiveRecordingData,
  type CurrentMeetingDetailData,
  type CurrentMeetingState,
} from '../model/current-meeting-state';

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code?: string } | null;
}

const unwrap = <T>(response: ApiResponse<T>, message: string): T => {
  if (!response.success || !response.data) throw new Error(message);
  return response.data;
};

const getMeeting = async (meetingId: number) => {
  const response = await apiClient.get<ApiResponse<CurrentMeetingDetailData>>(
    `/api/v1/meetings/${meetingId}`,
  );
  return unwrap(response.data, '회의 정보를 불러오지 못했습니다.');
};

const getActiveRecording = async (meetingId: number): Promise<ActiveRecordingData | null> => {
  try {
    const response = await apiClient.get<ApiResponse<ActiveRecordingData>>(
      `/api/v1/meetings/${meetingId}/recording`,
    );
    return unwrap(response.data, '활성 녹음 정보를 불러오지 못했습니다.');
  } catch (error) {
    if (
      axios.isAxiosError<ApiResponse<never>>(error) &&
      error.response?.status === 404 &&
      error.response.data.error?.code === 'RECORDING_SESSION_NOT_FOUND'
    ) {
      return null;
    }
    throw error;
  }
};

export const getCurrentMeetingState = async (meetingId: number): Promise<CurrentMeetingState> => {
  const meeting = await getMeeting(meetingId);
  const activeRecording =
    meeting.status === 'IN_PROGRESS' ? await getActiveRecording(meetingId) : null;

  return toCurrentMeetingState(meeting, activeRecording);
};

export type { CurrentMeetingState };
