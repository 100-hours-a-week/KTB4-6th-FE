import axios from 'axios';

export const isInsufficientCreditError = (error: unknown) =>
  axios.isAxiosError<{ error?: { code?: string } | null }>(error) &&
  error.response?.status === 409 &&
  error.response.data?.error?.code === 'INSUFFICIENT_CREDIT';

export const isAudioFileNotUploadingError = (error: unknown) =>
  axios.isAxiosError<{ error?: { code?: string } | null }>(error) &&
  error.response?.status === 409 &&
  error.response.data?.error?.code === 'AUDIO_FILE_NOT_UPLOADING';

export class UnsupportedRecordingBrowserError extends Error {
  constructor() {
    super('이 브라우저에서는 녹음을 사용할 수 없습니다.');
    this.name = 'UnsupportedRecordingBrowserError';
  }
}

export const isUnsupportedRecordingBrowserError = (error: unknown) =>
  error instanceof UnsupportedRecordingBrowserError;
