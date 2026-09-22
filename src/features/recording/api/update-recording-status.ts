import { apiClient } from '@/shared/api';

export type RecordingStatusChange = 'PAUSED' | 'RECORDING';

interface UpdateRecordingStatusResponse {
  success: boolean;
  data: {
    recordingSessionId: number;
    status: RecordingStatusChange;
  } | null;
  error: unknown | null;
}

export interface UpdateRecordingStatusParams {
  recordingSessionId: number;
  status: RecordingStatusChange;
}

export const updateRecordingStatus = async ({
  recordingSessionId,
  status,
}: UpdateRecordingStatusParams): Promise<void> => {
  const response = await apiClient.patch<UpdateRecordingStatusResponse>(
    `/api/v1/recordings/${recordingSessionId}`,
    { status },
  );
  const result = response.data;

  if (
    !result.success ||
    result.data?.recordingSessionId !== recordingSessionId ||
    result.data.status !== status
  ) {
    throw new Error('녹음 상태 변경 응답이 올바르지 않습니다.');
  }
};
