import {
  AAC_ENCODER_CONFIG,
  AAC_FRAME_SAMPLES,
  captureException,
  closeAacEncoder,
  encodeAacSamples,
  isSameAacEncoding,
  toAacSample,
  UPSAMPLE_FACTOR,
  upsamplePcmChunk,
} from '@/shared/lib';
import {
  flushEncodedFrames,
  saveEncodedFrame,
  saveEncodingMeta,
  toEncodedFrame,
} from './encoded-frame-writer';
import {
  deleteEncodedRecording,
  getEncodedFramesEndUs,
  getEncodingMeta,
} from './encoded-recording-store';
import { findRecordingChunkSeqAt, readRecordingChunksFrom } from './recording-chunk-store';
import type { EncodedFrame } from './recording-db';
import { markRecordingStorageFailure } from './recording-storage';

const RECOVERY_MARGIN_SAMPLES = 10 * AAC_FRAME_SAMPLES;
const RECOVERY_READ_BATCH_SIZE = 50;

let sessionEncoder: { recordingSessionId: number; encoder: AudioEncoder } | null = null;
let reportedFailureSessionId: number | null = null;
let pendingEncodingTask: Promise<void> | null = null;

const reportEncodingFailure = (recordingSessionId: number, error: unknown) => {
  if (reportedFailureSessionId === recordingSessionId) return;
  reportedFailureSessionId = recordingSessionId;

  captureException(error, {
    tags: {
      feature: 'recording-encoding',
      'recording.session_id': recordingSessionId,
      ...(error instanceof DOMException && { 'encoding.error': error.name }),
    },
  });
};

const createSessionEncoder = (recordingSessionId: number, keepFromSample = 0) => {
  if (sessionEncoder) closeAacEncoder(sessionEncoder.encoder);
  const onFailure = (error: unknown) => reportEncodingFailure(recordingSessionId, error);
  const onWriteFailure = (error: unknown) => {
    markRecordingStorageFailure(recordingSessionId);
    onFailure(error);
  };
  const encoder = new AudioEncoder({
    output: (chunk, metadata) => {
      if (metadata?.decoderConfig) {
        saveEncodingMeta(recordingSessionId, metadata.decoderConfig, onWriteFailure);
      }
      if (toAacSample(chunk.timestamp) < keepFromSample) return;
      saveEncodedFrame(recordingSessionId, chunk, onWriteFailure);
    },
    error: onFailure,
  });
  encoder.configure(AAC_ENCODER_CONFIG);
  sessionEncoder = { recordingSessionId, encoder };
  return encoder;
};

const getLiveSessionEncoder = (recordingSessionId: number) =>
  sessionEncoder?.recordingSessionId === recordingSessionId &&
  sessionEncoder.encoder.state === 'configured'
    ? sessionEncoder.encoder
    : null;

const getSessionEncoder = (recordingSessionId: number) =>
  getLiveSessionEncoder(recordingSessionId) ?? createSessionEncoder(recordingSessionId);

const runAfterPendingTask = (task: () => void | Promise<void>) => {
  const next = (pendingEncodingTask ?? Promise.resolve()).then(task);
  pendingEncodingTask = next;
  void next.finally(() => {
    if (pendingEncodingTask === next) pendingEncodingTask = null;
  });
  return next;
};

const encodeChunkNow = (recordingSessionId: number, chunk: ArrayBuffer, startSample: number) => {
  try {
    encodeAacSamples(
      getSessionEncoder(recordingSessionId),
      upsamplePcmChunk(chunk),
      startSample * UPSAMPLE_FACTOR,
    );
  } catch (error) {
    reportEncodingFailure(recordingSessionId, error);
  }
};

export const encodeRecordingChunk = (
  recordingSessionId: number,
  chunk: ArrayBuffer,
  startSample: number,
) => {
  if (pendingEncodingTask) {
    void runAfterPendingTask(() => encodeChunkNow(recordingSessionId, chunk, startSample));
    return;
  }
  encodeChunkNow(recordingSessionId, chunk, startSample);
};

const discardMismatchedEncoding = async (recordingSessionId: number) => {
  const meta = await getEncodingMeta(recordingSessionId);
  if (!meta || isSameAacEncoding(meta)) return;

  reportEncodingFailure(
    recordingSessionId,
    new Error(
      `저장된 인코딩 설정(${meta.codec}, ${meta.sampleRate}Hz, ${meta.numberOfChannels}ch)이 현재 설정과 달라 처음부터 다시 인코딩합니다.`,
    ),
  );
  await deleteEncodedRecording(recordingSessionId);
};

const getResumePoint = async (recordingSessionId: number) => {
  await discardMismatchedEncoding(recordingSessionId);
  const endSample = toAacSample(await getEncodedFramesEndUs(recordingSessionId));
  const resumeSample = Math.max(0, endSample - RECOVERY_MARGIN_SAMPLES);
  const seq = await findRecordingChunkSeqAt(
    recordingSessionId,
    Math.floor(resumeSample / UPSAMPLE_FACTOR),
  );
  return { endSample, resumeSample, seq };
};

const feedStoredPcm = async (
  recordingSessionId: number,
  encoder: AudioEncoder,
  fromSeq: number,
  resumeSample: number,
  untilSeq: number,
) => {
  let seq: number | null = fromSeq;
  while (seq !== null) {
    const chunks = await readRecordingChunksFrom(
      recordingSessionId,
      seq,
      untilSeq,
      RECOVERY_READ_BATCH_SIZE,
    );
    for (const chunk of chunks) {
      const chunkStartSample = chunk.startSample * UPSAMPLE_FACTOR;
      const offset = Math.max(0, resumeSample - chunkStartSample);
      const data = upsamplePcmChunk(chunk.data).subarray(offset);
      if (data.length > 0) encodeAacSamples(encoder, data, chunkStartSample + offset);
    }
    seq = chunks.length === RECOVERY_READ_BATCH_SIZE ? chunks[chunks.length - 1].seq + 1 : null;
  }
};

const recoverNow = async (recordingSessionId: number, untilSeq: number) => {
  try {
    const { endSample, resumeSample, seq } = await getResumePoint(recordingSessionId);
    if (seq === null) return;

    const encoder = createSessionEncoder(recordingSessionId, endSample);
    await feedStoredPcm(recordingSessionId, encoder, seq, resumeSample, untilSeq);
  } catch (error) {
    reportEncodingFailure(recordingSessionId, error);
  }
};

export const recoverRecordingEncoding = (recordingSessionId: number, untilSeq: number) =>
  runAfterPendingTask(() => recoverNow(recordingSessionId, untilSeq));

export const finishRecordingEncoding = async (recordingSessionId: number) => {
  await pendingEncodingTask;
  await flushEncodedFrames();

  const tailFrames: EncodedFrame[] = [];
  const onFailure = (error: unknown) => reportEncodingFailure(recordingSessionId, error);
  try {
    const { endSample, resumeSample, seq } = await getResumePoint(recordingSessionId);
    if (seq === null) return tailFrames;

    const encoder = new AudioEncoder({
      output: (chunk, metadata) => {
        if (metadata?.decoderConfig) {
          saveEncodingMeta(recordingSessionId, metadata.decoderConfig, onFailure);
        }
        if (toAacSample(chunk.timestamp) < endSample) return;
        tailFrames.push(toEncodedFrame(recordingSessionId, chunk));
      },
      error: onFailure,
    });
    try {
      encoder.configure(AAC_ENCODER_CONFIG);
      await feedStoredPcm(recordingSessionId, encoder, seq, resumeSample, Number.POSITIVE_INFINITY);
      await encoder.flush();
    } finally {
      closeAacEncoder(encoder);
    }
    await flushEncodedFrames();
  } catch (error) {
    onFailure(error);
  }
  return tailFrames;
};

export const closeRecordingEncoding = (recordingSessionId: number) => {
  if (sessionEncoder?.recordingSessionId !== recordingSessionId) return;
  closeAacEncoder(sessionEncoder.encoder);
  sessionEncoder = null;
};
