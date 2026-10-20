import { UnsupportedRecordingBrowserError } from './errors';
import { PCM_SAMPLE_RATE } from './pcm-capture';

const AAC_SAMPLE_RATE = 48_000;
const UPSAMPLE_FACTOR = AAC_SAMPLE_RATE / PCM_SAMPLE_RATE;
const INT16_SCALE = 32_768;

export const AAC_ENCODER_CONFIG: AudioEncoderConfig = {
  codec: 'mp4a.40.2',
  sampleRate: AAC_SAMPLE_RATE,
  numberOfChannels: 1,
  bitrate: 48_000,
};

const AAC_SUPPORT_CHECK_FRAMES = 4_800;
const AAC_SUPPORT_CHECK_TIMEOUT_MS = 3_000;

let aacSupportCheck: Promise<void> | null = null;

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
