import type { ApiResponse } from './common';

export type AudioFileStatus =
  'UPLOADING' | 'AVAILABLE' | 'UPLOAD_FAILED' | 'DELETE_PENDING' | 'DELETED' | 'DELETE_FAILED';

export interface AudioFileData {
  audioFileId: number;
  recordingSessionId: number;
  contentType: string;
  fileSizeBytes: number;
  durationMs: number;
  status: AudioFileStatus;
  storedAt: string;
  expiresAt: string;
}

export type AudioFileResponse = ApiResponse<AudioFileData>;

export interface AudioDownloadUrlData {
  downloadUrl: string;
  downloadUrlExpiresAt: string;
}

export type AudioDownloadUrlResponse = ApiResponse<AudioDownloadUrlData>;

export interface AudioFileDeleteData {
  audioFileId: number;
  status: AudioFileStatus;
}

export type AudioFileDeleteResponse = ApiResponse<AudioFileDeleteData>;
