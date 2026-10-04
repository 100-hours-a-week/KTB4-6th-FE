'use client';

import * as Sentry from '@sentry/nextjs';
import { isOpfsSupported } from '@/shared/lib';
import { flushRecordingChunks } from './useRecordingChunkBuffer';
import { readOpfsPartFilesInOrder, removeOpfsPartFiles } from './opfs-recording-parts';
import {
  deleteRecordingChunks,
  isIndexedDbSupported,
  readRecordingChunkParts,
} from './recording-chunk-db';
import { useMediaRecorder } from './useMediaRecorder';
import { useRecordingSessionStore } from './useRecordingSessionStore';
import { useUploadRecordingFile } from './useUploadRecordingFile';

const WEBM_EBML_HEADER = [0x1a, 0x45, 0xdf, 0xa3];
const WEBM_CLUSTER_ID = [0x1f, 0x43, 0xb6, 0x75];
// 오디오 데이터(Cluster)는 헤더 바로 뒤에 오므로 앞부분만 확인한다.
const WEBM_CLUSTER_SEARCH_BYTES = 64 * 1024;

const startsWith = (bytes: Uint8Array, pattern: number[]) =>
  pattern.every((value, index) => bytes[index] === value);

const includesSequence = (bytes: Uint8Array, pattern: number[]) => {
  for (let start = 0; start <= bytes.length - pattern.length; start += 1) {
    if (pattern.every((value, index) => bytes[start + index] === value)) return true;
  }
  return false;
};

// 녹음 직후 바로 일시정지하면 헤더 일부만 있는 part가 남아 ffmpeg 병합이 통째로 실패한다.
// webm은 헤더와 오디오 데이터가 있는 part만, webm이 아닌 형식(mp4 등)은 비어있지 않으면 병합한다.
const isMergeableRecordingPart = async (part: Blob) => {
  if (part.size === 0) return false;

  const head = new Uint8Array(
    await part.slice(0, Math.min(part.size, WEBM_CLUSTER_SEARCH_BYTES)).arrayBuffer(),
  );
  if (!startsWith(head, WEBM_EBML_HEADER.slice(0, head.length))) return true;

  return startsWith(head, WEBM_EBML_HEADER) && includesSequence(head, WEBM_CLUSTER_ID);
};

// IndexedDB 전환 전에 시작된 녹음은 앞부분이 OPFS part로 남아 있어 앞에 붙여 병합한다.
const readLegacyOpfsParts = async (recordingSessionId: number): Promise<Blob[]> => {
  if (!isOpfsSupported()) return [];
  try {
    return await readOpfsPartFilesInOrder(recordingSessionId);
  } catch {
    return [];
  }
};

/**
 * 이 세션의 part들을 순서대로 병합·변환한 뒤 업로드하고, 성공하면 로컬 저장분을 정리한다.
 *
 * recorder가 살아있는지는 신경 쓰지 않는다 — 살아있는 recorder에서 마지막 chunk까지
 * 마저 흘려보내야 하는지(회의를 정상 종료하는 경우)는 호출하는 쪽 책임이고, 이미
 * 업로드가 끝났는지 확인해 다시 부를지 말지 정하는 것도 호출하는 쪽 책임이다.
 */
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
      // 업로드 단계는 뮤테이션이라 React Query 전역 핸들러가 이미 보고하므로 그 전 단계만 보고한다.
      if (stage !== 'upload') {
        Sentry.captureException(error, {
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
