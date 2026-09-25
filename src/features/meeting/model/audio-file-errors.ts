import { MeetingApiError } from './errors';

/** 보관 기간이 지나 더 이상 사용할 수 없는 음성 파일 (410 AUDIO_FILE_EXPIRED) */
export const isAudioFileExpiredError = (error: unknown) =>
  error instanceof MeetingApiError && error.code === 'AUDIO_FILE_EXPIRED';

/** 업로드 중이거나 삭제되는 등 아직 사용할 수 없는 음성 파일 (409 AUDIO_FILE_NOT_AVAILABLE) */
export const isAudioFileNotAvailableError = (error: unknown) =>
  error instanceof MeetingApiError && error.code === 'AUDIO_FILE_NOT_AVAILABLE';
