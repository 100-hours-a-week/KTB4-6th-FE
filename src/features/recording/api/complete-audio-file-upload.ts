import { apiClient } from '@/shared/api';

interface CompleteAudioFileUploadResponse {
  success: boolean;
  data: {
    audioFileId: number;
    status: 'AVAILABLE';
    contentType: string;
    fileSizeBytes: number;
    durationMs: number;
    storedAt: string;
    expiresAt: string;
  } | null;
  error: unknown | null;
}

interface CompleteAudioFileUploadParams {
  audioFileId: number;
  fileSizeBytes: number;
  durationMs: number;
}

export const completeAudioFileUpload = async ({
  audioFileId,
  fileSizeBytes,
  durationMs,
}: CompleteAudioFileUploadParams): Promise<void> => {
  const response = await apiClient.patch<CompleteAudioFileUploadResponse>(
    `/api/v1/audio-files/${audioFileId}`,
    { fileSizeBytes, durationMs },
  );
  const result = response.data;

  if (
    !result.success ||
    result.data?.audioFileId !== audioFileId ||
    result.data.status !== 'AVAILABLE' ||
    result.data.fileSizeBytes !== fileSizeBytes ||
    result.data.durationMs !== durationMs
  ) {
    throw new Error('녹음 파일 업로드 완료 응답이 올바르지 않습니다.');
  }
};
