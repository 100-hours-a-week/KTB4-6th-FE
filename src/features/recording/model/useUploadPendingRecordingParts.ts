'use client';

import { captureException, isOpfsSupported } from '@/shared/lib';
import { flushRecordingChunks } from './useRecordingChunkBuffer';
import { readOpfsPartFilesInOrder, removeOpfsPartFiles } from './opfs-recording-parts';
import { deleteRecordingChunks, readRecordingChunkParts } from './recording-chunk-store';
import { isIndexedDbSupported } from './recording-db';
import { finishRecordingEncoding } from './recording-encoder';
import { useMediaRecorder } from './useMediaRecorder';
import { useRecordingSessionStore } from './useRecordingSessionStore';
import { useUploadRecordingFile } from './useUploadRecordingFile';

const WEBM_EBML_HEADER = [0x1a, 0x45, 0xdf, 0xa3];
const WEBM_CLUSTER_ID = [0x1f, 0x43, 0xb6, 0x75];
const WEBM_CLUSTER_SEARCH_BYTES = 64 * 1024;

const startsWith = (bytes: Uint8Array, pattern: number[]) =>
  pattern.every((value, index) => bytes[index] === value);

const includesSequence = (bytes: Uint8Array, pattern: number[]) => {
  for (let start = 0; start <= bytes.length - pattern.length; start += 1) {
    if (pattern.every((value, index) => bytes[start + index] === value)) return true;
  }
  return false;
};

const isMergeableRecordingPart = async (part: Blob) => {
  if (part.size === 0) return false;

  const head = new Uint8Array(
    await part.slice(0, Math.min(part.size, WEBM_CLUSTER_SEARCH_BYTES)).arrayBuffer(),
  );
  if (!startsWith(head, WEBM_EBML_HEADER.slice(0, head.length))) return true;

  return startsWith(head, WEBM_EBML_HEADER) && includesSequence(head, WEBM_CLUSTER_ID);
};

const readLegacyOpfsParts = async (recordingSessionId: number): Promise<Blob[]> => {
  if (!isOpfsSupported()) return [];
  try {
    return await readOpfsPartFilesInOrder(recordingSessionId);
  } catch {
    return [];
  }
};

export const useUploadPendingRecordingParts = () => {
  const convertToMp4 = useMediaRecorder((state) => state.convertToMp4);
  const uploadRecordingFile = useUploadRecordingFile();
  const setPendingUpload = useRecordingSessionStore((state) => state.setPendingUpload);
  const markPendingUploadCompleted = useRecordingSessionStore(
    (state) => state.markPendingUploadCompleted,
  );

  return async (recordingSessionId: number) => {
    const currentUpload = useRecordingSessionStore.getState().pendingUpload;
    const reusableUpload =
      currentUpload?.recordingSessionId === recordingSessionId ? currentUpload : null;
    let stage: 'read' | 'convert' | 'upload' = 'read';

    try {
      await flushRecordingChunks();
      if (isIndexedDbSupported()) await finishRecordingEncoding(recordingSessionId);
      const allParts = [
        ...(await readLegacyOpfsParts(recordingSessionId)),
        ...(isIndexedDbSupported() ? await readRecordingChunkParts(recordingSessionId) : []),
      ];
      const mergeable = await Promise.all(allParts.map(isMergeableRecordingPart));
      const parts = allParts.filter((_, index) => mergeable[index]);
      if (parts.length === 0) throw new Error('저장된 녹음 파일이 없습니다.');

      stage = 'convert';
      const convertedRecording = await convertToMp4(parts, `recording-${recordingSessionId}.mp4`);

      stage = 'upload';
      await uploadRecordingFile.mutateAsync({
        recordingSessionId,
        ...convertedRecording,
        uploadTarget: reusableUpload ?? undefined,
        onUploadTargetCreated: (target) =>
          setPendingUpload({
            recordingSessionId,
            ...target,
            isCompleted: false,
          }),
      });
    } catch (error) {
      if (stage !== 'upload') {
        captureException(error, {
          tags: {
            feature: 'recording-upload',
            'recording.session_id': recordingSessionId,
            'recording.upload_stage': stage,
          },
        });
      }
      throw error;
    }

    markPendingUploadCompleted(recordingSessionId);
    await Promise.all([
      isOpfsSupported() ? removeOpfsPartFiles(recordingSessionId).catch(() => {}) : undefined,
      isIndexedDbSupported()
        ? deleteRecordingChunks(recordingSessionId).catch(() => {})
        : undefined,
    ]);
  };
};
