import { putEncodedFrames, putEncodingMeta, type EncodedFrame } from './recording-chunk-db';

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

  void putEncodingMeta({
    recordingSessionId,
    codec: config.codec,
    sampleRate: config.sampleRate,
    numberOfChannels: config.numberOfChannels,
    description: copyToArrayBuffer(config.description),
  }).catch(onFailure);
};

export const saveEncodedFrame = (
  recordingSessionId: number,
  chunk: EncodedAudioChunk,
  onFailure: WriteFailureHandler,
) => {
  const data = new ArrayBuffer(chunk.byteLength);
  chunk.copyTo(data);
  queuedFrames.push({
    recordingSessionId,
    timestampUs: chunk.timestamp,
    durationUs: chunk.duration ?? 0,
    data,
  });
  if (queuedFrames.length > 1) return;

  pendingFrameWrite = pendingFrameWrite.then(() => {
    const frames = queuedFrames;
    queuedFrames = [];
    return putEncodedFrames(frames).catch(onFailure);
  });
};
