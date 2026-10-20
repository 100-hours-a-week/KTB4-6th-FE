import { UnsupportedRecordingBrowserError } from './errors';

const PCM_SAMPLE_RATE = 16_000;
const PCM_CHUNK_SAMPLES = 1_600;
const PCM_CAPTURE_WORKLET_URL = '/worklets/pcm-capture-processor.js';
const PCM_CAPTURE_PROCESSOR_NAME = 'pcm-capture';

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
