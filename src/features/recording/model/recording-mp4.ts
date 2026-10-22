import {
  BufferTarget,
  EncodedAudioPacketSource,
  EncodedPacket,
  Mp4OutputFormat,
  Output,
} from 'mediabunny';
import { toAacSample } from './aac-encoder';
import { getEncodingMeta, readEncodedFramesFrom } from './encoded-recording-store';
import type { EncodedFrame } from './recording-db';

const MP4_READ_BATCH_SIZE = 2_000;
const US_PER_SECOND = 1_000_000;

export const buildRecordingMp4 = async (
  recordingSessionId: number,
  tailFrames: EncodedFrame[] = [],
) => {
  const meta = await getEncodingMeta(recordingSessionId);
  if (!meta) throw new Error('녹음 파일 정보를 찾을 수 없습니다.');

  const target = new BufferTarget();
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target });
  const source = new EncodedAudioPacketSource('aac');
  output.addAudioTrack(source);
  await output.start();

  const decoderConfig: AudioDecoderConfig = {
    codec: meta.codec,
    sampleRate: meta.sampleRate,
    numberOfChannels: meta.numberOfChannels,
    description: meta.description,
  };
  let frameCount = 0;
  let storedEndSample = 0;
  let fromTimestampUs = Number.NEGATIVE_INFINITY;

  const addFrame = async (frame: EncodedFrame) => {
    const packet = new EncodedPacket(
      new Uint8Array(frame.data),
      'key',
      frame.timestampUs / US_PER_SECOND,
      frame.durationUs / US_PER_SECOND,
    );
    await source.add(packet, frameCount === 0 ? { decoderConfig } : undefined);
    frameCount += 1;
  };

  try {
    for (;;) {
      const frames = await readEncodedFramesFrom(
        recordingSessionId,
        fromTimestampUs,
        MP4_READ_BATCH_SIZE,
      );
      for (const frame of frames) {
        await addFrame(frame);
        storedEndSample = toAacSample(frame.timestampUs + frame.durationUs);
      }
      if (frames.length < MP4_READ_BATCH_SIZE) break;
      fromTimestampUs = frames[frames.length - 1].timestampUs + 1;
    }
    for (const frame of tailFrames) {
      if (toAacSample(frame.timestampUs) >= storedEndSample) await addFrame(frame);
    }
    if (frameCount === 0) throw new Error('저장된 녹음 파일이 없습니다.');

    await output.finalize();
  } catch (error) {
    await output.cancel();
    throw error;
  }

  if (!target.buffer) throw new Error('녹음 파일을 만들지 못했습니다.');
  return new File([target.buffer], `recording-${recordingSessionId}.mp4`, { type: 'audio/mp4' });
};
