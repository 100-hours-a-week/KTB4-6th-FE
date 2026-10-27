'use client';

import axios from 'axios';
import { create } from 'zustand';
import { captureException, parseServerDate } from '@/shared/lib';
import { completeAudioFileUpload } from '../api/complete-audio-file-upload';
import {
  createAudioFileUploadUrl,
  type AudioFileUploadTarget,
} from '../api/create-audio-file-upload-url';
import { uploadAudioFile } from '../api/upload-audio-file';
import { deleteEncodedRecording } from './encoded-recording-store';
import { isAudioFileNotUploadingError } from './errors';
import { deletePendingUpload, getPendingUploads, putPendingUpload } from './pending-upload-store';
import { deleteRecordingChunks } from './recording-chunk-store';
import {
  deleteStaleRecordingChunks,
  isIndexedDbSupported,
  type PendingRecordingUpload,
} from './recording-db';
import { closeRecordingEncoding } from './recording-encoder';
import { buildRecordingFile, type RecordingFile } from './recording-file';

const RETRY_DELAYS_MS = [0, 5_000, 15_000, 60_000];
const UPLOAD_URL_EXPIRY_MARGIN_MS = 30_000;
const STALE_RECORDING_AGE_MS = 3 * 60 * 60 * 1000;

type UploadStage = 'url' | 'put' | 'complete';

interface RecordingUploadState {
  uploadingSessionIds: number[];
}

export const useRecordingUploadStore = create<RecordingUploadState>(() => ({
  uploadingSessionIds: [],
}));

const runningSessionIds = new Set<number>();
let resumingUploads: Promise<void> | null = null;

const setUploading = (recordingSessionId: number, isUploading: boolean) =>
  useRecordingUploadStore.setState(({ uploadingSessionIds }) => ({
    uploadingSessionIds: isUploading
      ? [...uploadingSessionIds, recordingSessionId]
      : uploadingSessionIds.filter((id) => id !== recordingSessionId),
  }));

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const isUploadUrlUsable = ({ uploadUrlExpiresAt }: AudioFileUploadTarget) =>
  parseServerDate(uploadUrlExpiresAt).getTime() - UPLOAD_URL_EXPIRY_MARGIN_MS > Date.now();

const clearUploadedRecording = async (recordingSessionId: number) => {
  closeRecordingEncoding(recordingSessionId);
  await Promise.all([
    deletePendingUpload(recordingSessionId).catch(() => {}),
    deleteRecordingChunks(recordingSessionId).catch(() => {}),
    deleteEncodedRecording(recordingSessionId).catch(() => {}),
  ]);
};

const runUpload = async (
  initialUpload: PendingRecordingUpload,
  preparedFile: RecordingFile | null,
) => {
  const { recordingSessionId } = initialUpload;
  let upload = initialUpload;
  let recordingFile = preparedFile;

  if (!upload.storedFile && !recordingFile) {
    recordingFile = await buildRecordingFile(recordingSessionId).catch(() => null);
    if (!recordingFile) return;
  }

  const saveUpload = async (next: PendingRecordingUpload) => {
    upload = next;
    await putPendingUpload(next).catch(() => {});
  };

  let stage: UploadStage = 'url';
  let attempts = 0;

  const uploadOnce = async () => {
    let { uploadTarget, storedFile } = upload;
    stage = 'url';

    if (!uploadTarget || !storedFile) {
      if (!recordingFile) throw new Error('저장된 녹음 파일이 없습니다.');
      const { file, durationMs } = recordingFile;

      if (!uploadTarget || !isUploadUrlUsable(uploadTarget)) {
        uploadTarget = await createAudioFileUploadUrl(recordingSessionId, file.type);
        await saveUpload({ ...upload, uploadTarget });
      }

      stage = 'put';
      await uploadAudioFile(uploadTarget.uploadUrl, file);
      storedFile = { fileSizeBytes: file.size, durationMs };
      await saveUpload({ ...upload, storedFile });
    }

    stage = 'complete';
    try {
      await completeAudioFileUpload({ audioFileId: uploadTarget.audioFileId, ...storedFile });
    } catch (error) {
      if (!isAudioFileNotUploadingError(error)) throw error;
    }
  };

  let lastError: unknown;
  for (const delayMs of RETRY_DELAYS_MS) {
    await wait(delayMs);
    attempts += 1;
    try {
      await uploadOnce();
      await clearUploadedRecording(recordingSessionId);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  captureException(lastError, {
    tags: {
      feature: 'recording-upload',
      'recording.session_id': recordingSessionId,
      'recording.upload_stage': stage,
      'recording.upload_attempts': attempts,
      ...(axios.isAxiosError(lastError) && {
        'api.status': lastError.response?.status ?? 'network',
      }),
    },
  });
};

const withUploadLock = (recordingSessionId: number, task: () => Promise<void>) =>
  'locks' in navigator
    ? navigator.locks.request(
        `meety-recording-upload-${recordingSessionId}`,
        { ifAvailable: true },
        (lock) => (lock ? task() : undefined),
      )
    : task();

const startUpload = (upload: PendingRecordingUpload, preparedFile: RecordingFile | null) => {
  const { recordingSessionId } = upload;
  if (runningSessionIds.has(recordingSessionId)) return;

  runningSessionIds.add(recordingSessionId);
  setUploading(recordingSessionId, true);
  void withUploadLock(recordingSessionId, () => runUpload(upload, preparedFile))
    .catch(() => {})
    .finally(() => {
      runningSessionIds.delete(recordingSessionId);
      setUploading(recordingSessionId, false);
    });
};

export const enqueueRecordingUpload = (
  recordingSessionId: number,
  preparedFile: RecordingFile | null,
) => {
  if (!isIndexedDbSupported()) return;

  const upload = { recordingSessionId, createdAt: Date.now() };
  void putPendingUpload(upload).catch(() => {});
  startUpload(upload, preparedFile);
};

export const resumeRecordingUploads = () => {
  if (!isIndexedDbSupported()) return;

  resumingUploads ??= (async () => {
    await deleteStaleRecordingChunks(STALE_RECORDING_AGE_MS).catch(() => {});
    const uploads = await getPendingUploads().catch(() => []);
    uploads.forEach((upload) => startUpload(upload, null));
  })();
};
