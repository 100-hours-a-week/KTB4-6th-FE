import { captureException, PCM_SAMPLE_RATE } from '@/shared/lib';
import { getNextRecordingChunkPosition } from './recording-chunk-store';
import { isIndexedDbSupported } from './recording-db';
import { finishRecordingEncoding } from './recording-encoder';
import { buildRecordingMp4 } from './recording-mp4';
import { flushRecordingChunks } from './useRecordingChunkBuffer';

export interface RecordingFile {
  file: File;
  durationMs: number;
}

const getRecordedDurationMs = async (recordingSessionId: number) => {
  const { startSample: totalSamples } = await getNextRecordingChunkPosition(recordingSessionId);
  return Math.round((totalSamples / PCM_SAMPLE_RATE) * 1000);
};

export const buildRecordingFile = async (recordingSessionId: number): Promise<RecordingFile> => {
  let stage: 'read' | 'build' = 'read';

  try {
    if (!isIndexedDbSupported()) throw new Error('저장된 녹음 파일이 없습니다.');
    await flushRecordingChunks();
    const tailFrames = await finishRecordingEncoding(recordingSessionId);

    stage = 'build';
    const file = await buildRecordingMp4(recordingSessionId, tailFrames);
    const durationMs = await getRecordedDurationMs(recordingSessionId);
    return { file, durationMs };
  } catch (error) {
    captureException(error, {
      tags: {
        feature: 'recording-upload',
        'recording.session_id': recordingSessionId,
        'recording.upload_stage': stage,
      },
    });
    throw error;
  }
};

export const prepareRecordingFile = (recordingSessionId: number) =>
  buildRecordingFile(recordingSessionId).catch(() => null);
