import { putEncodedFrames, putEncodingMeta } from './encoded-recording-store';
import type { EncodedFrame } from './recording-db';

type WriteFailureHandler = (error: unknown) => void;

let queuedFrames: EncodedFrame[] = [];
let pendingFrameWrite: Promise<void> = Promise.resolve();

const copyToArrayBuffer = (source: AllowSharedBufferSource) => {
  const bytes = ArrayBuffer.isView(source)
    ? new Uint8Array(source.buffer, source.byteOffset, source.byteLength)
    : new Uint8Array(source);
  return bytes.slice().buffer;
};

export const saveEncodingMeta = (
  recordingSessionId: number,
  config: AudioDecoderConfig,
  onFailure: WriteFailureHandler,
) => {
  if (!config.description) return;

  const meta = {
    recordingSessionId,
    codec: config.codec,
    sampleRate: config.sampleRate,
    numberOfChannels: config.numberOfChannels,
    description: copyToArrayBuffer(config.description),
  };
  pendingFrameWrite = pendingFrameWrite.then(() => putEncodingMeta(meta).catch(onFailure));
};

export const toEncodedFrame = (
  recordingSessionId: number,
  chunk: EncodedAudioChunk,
): EncodedFrame => {
  const data = new ArrayBuffer(chunk.byteLength);
  chunk.copyTo(data);
  return {
    recordingSessionId,
    timestampUs: chunk.timestamp,
    durationUs: chunk.duration ?? 0,
    data,
  };
};

export const saveEncodedFrame = (
  recordingSessionId: number,
  chunk: EncodedAudioChunk,
  onFailure: WriteFailureHandler,
) => {
  queuedFrames.push(toEncodedFrame(recordingSessionId, chunk));
  if (queuedFrames.length > 1) return;

  pendingFrameWrite = pendingFrameWrite.then(() => {
    const frames = queuedFrames;
    queuedFrames = [];
    return putEncodedFrames(frames).catch(onFailure);
  });
};

export const flushEncodedFrames = () => pendingFrameWrite;
