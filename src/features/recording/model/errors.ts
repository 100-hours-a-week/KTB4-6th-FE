import axios from 'axios';
import { UnsupportedRecordingBrowserError } from '@/shared/lib';

export const isInsufficientCreditError = (error: unknown) =>
  axios.isAxiosError<{ error?: { code?: string } | null }>(error) &&
  error.response?.status === 409 &&
  error.response.data?.error?.code === 'INSUFFICIENT_CREDIT';

export const isAudioFileNotUploadingError = (error: unknown) =>
  axios.isAxiosError<{ error?: { code?: string } | null }>(error) &&
  error.response?.status === 409 &&
  error.response.data?.error?.code === 'AUDIO_FILE_NOT_UPLOADING';

export const isUnsupportedRecordingBrowserError = (error: unknown) =>
  error instanceof UnsupportedRecordingBrowserError;
