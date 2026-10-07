export type RecordingSocketMessage =
  | { type: 'ack'; seq: number }
  | { type: 'recovery.start'; lastProcessedSequence: number }
  | { type: 'stream.ready' };

export type RecoveryMessageType = 'recovery.start' | 'stream.ready';
export type RecoveryMessage = Extract<RecordingSocketMessage, { type: RecoveryMessageType }>;

const SEQ_HEADER_BYTES = 8;

/** 녹음이 종료(COMPLETED)돼 BE가 닫음 */
export const CLOSE_CODE_COMPLETED = 1000;
/** 같은 녹음으로 새 연결이 들어와 BE가 이전 연결을 닫음 */
export const CLOSE_CODE_SUPERSEDED = 4001;

export const isRecoveryMessage = (message: RecordingSocketMessage): message is RecoveryMessage =>
  message.type === 'recovery.start' || message.type === 'stream.ready';

export const parseSocketMessage = (data: unknown): RecordingSocketMessage | null => {
  if (typeof data !== 'string') return null;

  let message: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(data);
    if (typeof parsed !== 'object' || parsed === null) return null;
    message = parsed as Record<string, unknown>;
  } catch {
    return null;
  }

  switch (message.type) {
    case 'ack':
      return Number.isSafeInteger(message.seq) ? { type: 'ack', seq: message.seq as number } : null;
    case 'recovery.start':
      return Number.isSafeInteger(message.lastProcessedSequence)
        ? {
            type: 'recovery.start',
            lastProcessedSequence: message.lastProcessedSequence as number,
          }
        : null;
    case 'stream.ready':
      return { type: 'stream.ready' };
    default:
      return null;
  }
};

/** [순번 8바이트, big-endian unsigned][오디오 바이트] */
export const createAudioFrame = (chunk: Blob, seq: number) => {
  const header = new ArrayBuffer(SEQ_HEADER_BYTES);
  new DataView(header).setBigUint64(0, BigInt(seq), false);
  return new Blob([header, chunk]);
};

export const createRecoveryFinishedMessage = (lastSequence: number) =>
  JSON.stringify({ type: 'recovery.finished', lastSequence });
