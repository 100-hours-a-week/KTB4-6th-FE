import { apiClient } from '@/shared/api';

interface StartRecordingResponse {
  success: boolean;
  data: { recordingSessionId: number } | null;
  error: unknown | null;
}

export const startRecording = async (meetingId: number): Promise<number> => {
  const response = await apiClient.post<StartRecordingResponse>(
    `/api/v1/meetings/${meetingId}/recordings`,
  );
  const result = response.data;
  const recordingSessionId = result.data?.recordingSessionId;

  if (
    !result.success ||
    typeof recordingSessionId !== 'number' ||
    !Number.isSafeInteger(recordingSessionId) ||
    recordingSessionId <= 0
  ) {
    throw new Error('녹음 시작 응답이 올바르지 않습니다.');
  }

  return recordingSessionId;
};
