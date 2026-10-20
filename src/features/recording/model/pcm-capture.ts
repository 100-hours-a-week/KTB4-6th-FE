import { UnsupportedRecordingBrowserError } from './errors';

const PCM_SAMPLE_RATE = 16_000;
const PCM_CHUNK_SAMPLES = 1_600;
const PCM_CAPTURE_WORKLET_URL = '/worklets/pcm-capture-processor.js';
const PCM_CAPTURE_PROCESSOR_NAME = 'pcm-capture';
const PCM_FLUSH_TIMEOUT_MS = 3_000;

export interface PcmCapture {
  stream: MediaStream;
  context: AudioContext;
  source: MediaStreamAudioSourceNode;
  node: AudioWorkletNode;
}

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
    return { stream, context, source, node };
  } catch (error) {
    void context?.close();
    if (error instanceof DOMException && error.name === 'NotSupportedError') {
      throw new UnsupportedRecordingBrowserError();
    }
    throw error;
  }
};

export const flushPcmCapture = ({ node }: PcmCapture) =>
  new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      node.port.removeEventListener('message', onMessage);
      node.removeEventListener('processorerror', onFailure);
    };
    const onMessage = ({ data }: MessageEvent<{ type: string }>) => {
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
