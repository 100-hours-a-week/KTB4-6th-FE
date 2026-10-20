import { UnsupportedRecordingBrowserError } from './errors';

export const AAC_ENCODER_CONFIG: AudioEncoderConfig = {
  codec: 'mp4a.40.2',
  sampleRate: 48_000,
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

export const ensureAacEncodingSupported = () => {
  aacSupportCheck ??= checkAacEncodingSupported().then((supported) => {
    if (supported) return;
    aacSupportCheck = null;
    throw new UnsupportedRecordingBrowserError();
  });
  return aacSupportCheck;
};
