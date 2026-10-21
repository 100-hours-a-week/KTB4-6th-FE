'use client';

import { captureException } from '@/shared/lib';
import { PCM_SAMPLE_RATE } from './pcm-capture';
import { deleteRecordingChunks, getNextRecordingChunkPosition } from './recording-chunk-store';
import { isIndexedDbSupported } from './recording-db';
import { finishRecordingEncoding } from './recording-encoder';
import { buildRecordingMp4 } from './recording-mp4';
import { flushRecordingChunks } from './useRecordingChunkBuffer';
import { useRecordingSessionStore } from './useRecordingSessionStore';
import { useUploadRecordingFile } from './useUploadRecordingFile';

const getRecordedDurationMs = async (recordingSessionId: number) => {
  const { startSample: totalSamples } = await getNextRecordingChunkPosition(recordingSessionId);
  return Math.round((totalSamples / PCM_SAMPLE_RATE) * 1000);
};

export const useUploadPendingRecordingParts = () => {
  const uploadRecordingFile = useUploadRecordingFile();
  const setPendingUpload = useRecordingSessionStore((state) => state.setPendingUpload);
  const markPendingUploadCompleted = useRecordingSessionStore(
    (state) => state.markPendingUploadCompleted,
  );

  return async (recordingSessionId: number) => {
    const currentUpload = useRecordingSessionStore.getState().pendingUpload;
    const reusableUpload =
      currentUpload?.recordingSessionId === recordingSessionId ? currentUpload : null;
    let stage: 'read' | 'build' | 'upload' = 'read';

    try {
      if (!isIndexedDbSupported()) throw new Error('저장된 녹음 파일이 없습니다.');
      await flushRecordingChunks();
      await finishRecordingEncoding(recordingSessionId);

      stage = 'build';
      const file = await buildRecordingMp4(recordingSessionId);
      const durationMs = await getRecordedDurationMs(recordingSessionId);

      stage = 'upload';
      await uploadRecordingFile.mutateAsync({
        recordingSessionId,
        file,
        durationMs,
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
    await deleteRecordingChunks(recordingSessionId).catch(() => {});
  };
};
