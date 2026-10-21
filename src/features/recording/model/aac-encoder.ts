import { captureException } from '@/shared/lib';
import { UnsupportedRecordingBrowserError } from './errors';
import { PCM_SAMPLE_RATE } from './pcm-capture';
import {
  findRecordingChunkSeqAt,
  getEncodedFramesEndUs,
  putEncodedFrames,
  putEncodingMeta,
  readRecordingChunksFrom,
  type EncodedFrame,
} from './recording-chunk-db';

const AAC_SAMPLE_RATE = 48_000;
const UPSAMPLE_FACTOR = AAC_SAMPLE_RATE / PCM_SAMPLE_RATE;
const INT16_SCALE = 32_768;
const AAC_SAMPLE_DURATION_US = 1_000_000 / AAC_SAMPLE_RATE;
const AAC_FRAME_SAMPLES = 1_024;
const RECOVERY_MARGIN_SAMPLES = 10 * AAC_FRAME_SAMPLES;
const RECOVERY_READ_BATCH_SIZE = 50;

export const AAC_ENCODER_CONFIG: AudioEncoderConfig = {
  codec: 'mp4a.40.2',
  sampleRate: AAC_SAMPLE_RATE,
  numberOfChannels: 1,
  bitrate: 48_000,
};

const AAC_SUPPORT_CHECK_FRAMES = 4_800;
const AAC_SUPPORT_CHECK_TIMEOUT_MS = 3_000;

let aacSupportCheck: Promise<void> | null = null;
let sessionEncoder: { recordingSessionId: number; encoder: AudioEncoder } | null = null;
let reportedFailureSessionId: number | null = null;
let queuedFrames: EncodedFrame[] = [];
let pendingFrameWrite: Promise<void> = Promise.resolve();

const closeEncoder = (encoder: AudioEncoder) => {
  if (encoder.state !== 'closed') encoder.close();
};

const encodeSilence = async () => {
  let outputBytes = 0;
  const encoder = new AudioEncoder({
    output: (chunk) => {
      outputBytes += chunk.byteLength;
    },
    error: () => {},
  });
  const timeoutId = window.setTimeout(() => closeEncoder(encoder), AAC_SUPPORT_CHECK_TIMEOUT_MS);

  try {
    encoder.configure(AAC_ENCODER_CONFIG);
    const audioData = new AudioData({
      format: 'f32',
      sampleRate: AAC_ENCODER_CONFIG.sampleRate,
      numberOfChannels: AAC_ENCODER_CONFIG.numberOfChannels,
      numberOfFrames: AAC_SUPPORT_CHECK_FRAMES,
      timestamp: 0,
      data: new Float32Array(AAC_SUPPORT_CHECK_FRAMES),
    });
    encoder.encode(audioData);
    audioData.close();
    await encoder.flush();
    return outputBytes > 0;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
    closeEncoder(encoder);
  }
};

const checkAacEncodingSupported = async () => {
  if (typeof AudioEncoder === 'undefined' || typeof AudioData === 'undefined') return false;

  try {
    const { supported } = await AudioEncoder.isConfigSupported(AAC_ENCODER_CONFIG);
    return supported === true && (await encodeSilence());
  } catch {
    return false;
  }
};

export const upsamplePcmChunk = (chunk: ArrayBuffer) => {
  const input = new Int16Array(chunk);
  const output = new Float32Array(input.length * UPSAMPLE_FACTOR);

  for (let i = 0; i < input.length; i++) {
    const current = input[i] / INT16_SCALE;
    const next = (input[i + 1] ?? input[i]) / INT16_SCALE;
    for (let step = 0; step < UPSAMPLE_FACTOR; step++) {
      output[i * UPSAMPLE_FACTOR + step] = current + ((next - current) * step) / UPSAMPLE_FACTOR;
    }
  }

  return output;
};

export const ensureAacEncodingSupported = () => {
  aacSupportCheck ??= checkAacEncodingSupported().then((supported) => {
    if (supported) return;
    aacSupportCheck = null;
    throw new UnsupportedRecordingBrowserError();
  });
  return aacSupportCheck;
};

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

const copyToArrayBuffer = (source: AllowSharedBufferSource) => {
  const bytes = ArrayBuffer.isView(source)
    ? new Uint8Array(source.buffer, source.byteOffset, source.byteLength)
    : new Uint8Array(source);
  return bytes.slice().buffer;
};

const saveEncodingMeta = (recordingSessionId: number, config: AudioDecoderConfig) => {
  if (!config.description) return;

  void putEncodingMeta({
    recordingSessionId,
    codec: config.codec,
    sampleRate: config.sampleRate,
    numberOfChannels: config.numberOfChannels,
    description: copyToArrayBuffer(config.description),
  }).catch((error: unknown) => {
    reportEncodingFailure(recordingSessionId, error);
  });
};

const saveEncodedFrame = (recordingSessionId: number, chunk: EncodedAudioChunk) => {
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
    return putEncodedFrames(frames).catch((error: unknown) => {
      reportEncodingFailure(recordingSessionId, error);
    });
  });
};

const createSessionEncoder = (recordingSessionId: number, keepFromSample = 0) => {
  if (sessionEncoder) closeEncoder(sessionEncoder.encoder);
  const encoder = new AudioEncoder({
    output: (chunk, metadata) => {
      if (metadata?.decoderConfig) saveEncodingMeta(recordingSessionId, metadata.decoderConfig);
      if (Math.round(chunk.timestamp / AAC_SAMPLE_DURATION_US) < keepFromSample) return;
      saveEncodedFrame(recordingSessionId, chunk);
    },
    error: (error) => reportEncodingFailure(recordingSessionId, error),
  });
  encoder.configure(AAC_ENCODER_CONFIG);
  sessionEncoder = { recordingSessionId, encoder };
  return encoder;
};

const getSessionEncoder = (recordingSessionId: number) =>
  sessionEncoder?.recordingSessionId === recordingSessionId &&
  sessionEncoder.encoder.state === 'configured'
    ? sessionEncoder.encoder
    : createSessionEncoder(recordingSessionId);

const encodeSamples = (
  encoder: AudioEncoder,
  data: Float32Array<ArrayBuffer>,
  startSample: number,
) => {
  const audioData = new AudioData({
    format: 'f32',
    sampleRate: AAC_SAMPLE_RATE,
    numberOfChannels: AAC_ENCODER_CONFIG.numberOfChannels,
    numberOfFrames: data.length,
    timestamp: Math.round(startSample * AAC_SAMPLE_DURATION_US),
    data,
  });
  try {
    encoder.encode(audioData);
  } finally {
    audioData.close();
  }
};

export const encodeRecordingChunk = (
  recordingSessionId: number,
  chunk: ArrayBuffer,
  startSample: number,
) => {
  try {
    encodeSamples(
      getSessionEncoder(recordingSessionId),
      upsamplePcmChunk(chunk),
      startSample * UPSAMPLE_FACTOR,
    );
  } catch (error) {
    reportEncodingFailure(recordingSessionId, error);
  }
};

export const recoverRecordingEncoding = async (recordingSessionId: number) => {
  try {
    const endSample = Math.round(
      (await getEncodedFramesEndUs(recordingSessionId)) / AAC_SAMPLE_DURATION_US,
    );
    const resumeSample = Math.max(0, endSample - RECOVERY_MARGIN_SAMPLES);
    let seq = await findRecordingChunkSeqAt(
      recordingSessionId,
      Math.floor(resumeSample / UPSAMPLE_FACTOR),
    );
    if (seq === null) return;

    createSessionEncoder(recordingSessionId, endSample);

    while (seq !== null) {
      const chunks = await readRecordingChunksFrom(
        recordingSessionId,
        seq,
        RECOVERY_READ_BATCH_SIZE,
      );
      for (const chunk of chunks) {
        const chunkStartSample = chunk.startSample * UPSAMPLE_FACTOR;
        const offset = Math.max(0, resumeSample - chunkStartSample);
        const data = upsamplePcmChunk(chunk.data).subarray(offset);
        if (data.length > 0) {
          encodeSamples(getSessionEncoder(recordingSessionId), data, chunkStartSample + offset);
        }
      }
      seq = chunks.length === RECOVERY_READ_BATCH_SIZE ? chunks[chunks.length - 1].seq + 1 : null;
    }
  } catch (error) {
    reportEncodingFailure(recordingSessionId, error);
  }
};
