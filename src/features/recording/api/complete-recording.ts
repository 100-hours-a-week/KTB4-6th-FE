import { apiClient } from '@/shared/api';

interface CompleteRecordingResponse {
  success: boolean;
  data: {
    recordingSessionId: number;
    status: 'PAUSED' | 'RECORDING' | 'COMPLETED';
  } | null;
  error: unknown | null;
}

export const completeRecording = async (recordingSessionId: number): Promise<void> => {
  const response = await apiClient.patch<CompleteRecordingResponse>(
    `/api/v1/recordings/${recordingSessionId}`,
    { status: 'COMPLETED' },
  );
  const result = response.data;

  if (
    !result.success ||
    result.data?.recordingSessionId !== recordingSessionId ||
    result.data.status !== 'COMPLETED'
  ) {
    throw new Error('녹음 종료 응답이 올바르지 않습니다.');
  }
};
