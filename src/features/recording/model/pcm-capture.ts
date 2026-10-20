import type { AudioFormat } from '@/entities/recording';
import { UnsupportedRecordingBrowserError } from './errors';

export const PCM_AUDIO_FORMAT: AudioFormat = 'pcm_s16le';

const PCM_SAMPLE_RATE = 16_000;
const PCM_BYTES_PER_SAMPLE = 2;
const PCM_CHUNK_SAMPLES = 1_600;
const PCM_CAPTURE_WORKLET_URL = '/worklets/pcm-capture-processor.js';
const PCM_CAPTURE_PROCESSOR_NAME = 'pcm-capture';
const PCM_RESUME_TIMEOUT_MS = 3_000;
const PCM_FLUSH_TIMEOUT_MS = 3_000;

type PcmCaptureMessage = { type: 'chunk'; chunk: ArrayBuffer } | { type: 'flushed' };

export interface PcmCapture {
  stream: MediaStream;
  context: AudioContext;
  source: MediaStreamAudioSourceNode;
  node: AudioWorkletNode;
}

export const countPcmSamples = (chunk: ArrayBuffer) => chunk.byteLength / PCM_BYTES_PER_SAMPLE;

export const createPcmCapture = async (stream: MediaStream): Promise<PcmCapture> => {
  if (typeof AudioContext === 'undefined' || typeof AudioWorkletNode === 'undefined') {
    throw new UnsupportedRecordingBrowserError();
  }

  let context: AudioContext | undefined;
  try {
    context = new AudioContext({ sampleRate: PCM_SAMPLE_RATE });
    const source = context.createMediaStreamSource(stream);
    await context.audioWorklet.addModule(PCM_CAPTURE_WORKLET_URL);
    const node = new AudioWorkletNode(context, PCM_CAPTURE_PROCESSOR_NAME, {
      numberOfOutputs: 0,
      processorOptions: { chunkSamples: PCM_CHUNK_SAMPLES },
    });

    if (context.state === 'suspended') {
      await Promise.race([
        context.resume(),
        new Promise((resolve) => window.setTimeout(resolve, PCM_RESUME_TIMEOUT_MS)),
      ]);
    }
    if (context.state !== 'running') {
      throw new Error('오디오 입력을 시작하지 못했습니다.');
    }

    return { stream, context, source, node };
  } catch (error) {
    void context?.close();
    if (error instanceof DOMException && error.name === 'NotSupportedError') {
      throw new UnsupportedRecordingBrowserError();
    }
    throw error;
  }
};

export const startPcmCapture = (
  { source, node }: PcmCapture,
  onChunk: (chunk: ArrayBuffer) => void,
) => {
  node.port.onmessage = ({ data }: MessageEvent<PcmCaptureMessage>) => {
    if (data.type === 'chunk') onChunk(data.chunk);
  };
  source.connect(node);
};

export const flushPcmCapture = ({ node }: PcmCapture) =>
  new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      node.port.removeEventListener('message', onMessage);
      node.removeEventListener('processorerror', onFailure);
    };
    const onMessage = ({ data }: MessageEvent<PcmCaptureMessage>) => {
      if (data.type !== 'flushed') return;
      cleanup();
      resolve();
    };
    const onFailure = () => {
      cleanup();
      reject(new Error('브라우저 녹음 데이터를 마무리하지 못했습니다.'));
    };
    const timeoutId = window.setTimeout(onFailure, PCM_FLUSH_TIMEOUT_MS);

    node.port.addEventListener('message', onMessage);
    node.addEventListener('processorerror', onFailure);
    node.port.postMessage({ type: 'flush' });
  });

export const resumePcmCapture = ({ node }: PcmCapture) => {
  node.port.postMessage({ type: 'resume' });
};

export const releasePcmCapture = ({ stream, context, source, node }: PcmCapture) => {
  node.port.onmessage = null;
  node.port.close();
  source.disconnect();
  stream.getTracks().forEach((track) => track.stop());
  void context.close().catch(() => {});
};
