import {
  createPcmCapture,
  ensureAacEncodingSupported,
  releasePcmCapture,
  UnsupportedRecordingBrowserError,
  type PcmCapture,
} from '@/shared/lib';

export type VoiceProfileCaptureFailure = 'denied' | 'unsupported' | 'unavailable';

const stopStream = (stream: MediaStream) => stream.getTracks().forEach((track) => track.stop());

export const toCaptureFailure = (error: unknown): VoiceProfileCaptureFailure => {
  if (error instanceof UnsupportedRecordingBrowserError) return 'unsupported';
  if (
    error instanceof DOMException &&
    (error.name === 'NotAllowedError' || error.name === 'SecurityError')
  ) {
    return 'denied';
  }
  return 'unavailable';
};

export const openVoiceProfileCapture = async (
  isCancelled: () => boolean,
): Promise<PcmCapture | null> => {
  if (!navigator.mediaDevices?.getUserMedia) throw new UnsupportedRecordingBrowserError();
  await ensureAacEncodingSupported();

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  if (isCancelled()) {
    stopStream(stream);
    return null;
  }

  let capture: PcmCapture;
  try {
    capture = await createPcmCapture(stream);
  } catch (error) {
    stopStream(stream);
    throw error;
  }
  if (isCancelled()) {
    releasePcmCapture(capture);
    return null;
  }
  return capture;
};
