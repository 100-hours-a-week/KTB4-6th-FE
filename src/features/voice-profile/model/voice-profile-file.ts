import {
  BufferTarget,
  EncodedAudioPacketSource,
  EncodedPacket,
  Mp4OutputFormat,
  Output,
} from 'mediabunny';
import {
  AAC_ENCODER_CONFIG,
  closeAacEncoder,
  encodeAacSamples,
  toAudioSpecificConfig,
  upsamplePcmChunk,
} from '@/shared/lib';

const ENCODE_BATCH_SAMPLES = AAC_ENCODER_CONFIG.sampleRate;
const US_PER_SECOND = 1_000_000;

const mergePcmChunks = (sentenceChunks: Int16Array[][]) => {
  const chunks = sentenceChunks.flat();
  const merged = new Int16Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
};

const copyToArrayBuffer = (source: AllowSharedBufferSource) => {
  const bytes = ArrayBuffer.isView(source)
    ? new Uint8Array(source.buffer, source.byteOffset, source.byteLength)
    : new Uint8Array(source);
  return bytes.slice().buffer;
};

const encodeAac = async (pcm: Int16Array) => {
  const samples = upsamplePcmChunk(pcm.buffer as ArrayBuffer);
  const chunks: EncodedAudioChunk[] = [];
  let description: ArrayBuffer | null = null;
  let encodingError: unknown = null;

  const encoder = new AudioEncoder({
    output: (chunk, metadata) => {
      if (metadata?.decoderConfig?.description) {
        description = copyToArrayBuffer(metadata.decoderConfig.description);
      }
      chunks.push(chunk);
    },
    error: (error) => {
      encodingError = error;
    },
  });

  try {
    encoder.configure(AAC_ENCODER_CONFIG);
    for (let start = 0; start < samples.length; start += ENCODE_BATCH_SAMPLES) {
      encodeAacSamples(encoder, samples.slice(start, start + ENCODE_BATCH_SAMPLES), start);
    }
    await encoder.flush();
  } finally {
    closeAacEncoder(encoder);
  }

  if (encodingError) throw encodingError;
  if (!description || chunks.length === 0) throw new Error('음성 파일을 인코딩하지 못했습니다.');
  return { chunks, description };
};

export const buildVoiceProfileFile = async (sentenceChunks: Int16Array[][]) => {
  const pcm = mergePcmChunks(sentenceChunks);
  if (pcm.length === 0) throw new Error('녹음된 음성이 없습니다.');

  const { chunks, description } = await encodeAac(pcm);
  const target = new BufferTarget();
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target });
  const source = new EncodedAudioPacketSource('aac');
  output.addAudioTrack(source);

  const decoderConfig: AudioDecoderConfig = {
    codec: AAC_ENCODER_CONFIG.codec,
    sampleRate: AAC_ENCODER_CONFIG.sampleRate,
    numberOfChannels: AAC_ENCODER_CONFIG.numberOfChannels,
    description: toAudioSpecificConfig(description),
  };

  try {
    await output.start();
    for (const [index, chunk] of chunks.entries()) {
      const data = new Uint8Array(chunk.byteLength);
      chunk.copyTo(data);
      const packet = new EncodedPacket(
        data,
        'key',
        chunk.timestamp / US_PER_SECOND,
        (chunk.duration ?? 0) / US_PER_SECOND,
      );
      await source.add(packet, index === 0 ? { decoderConfig } : undefined);
    }
    await output.finalize();
  } catch (error) {
    await output.cancel();
    throw error;
  }

  if (!target.buffer) throw new Error('음성 파일을 만들지 못했습니다.');
  return new File([target.buffer], 'voice-profile.mp4', { type: 'audio/mp4' });
};
