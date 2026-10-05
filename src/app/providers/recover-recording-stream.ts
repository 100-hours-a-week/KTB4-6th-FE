import type { RecoveryMessage } from '@/features/recording-websocket';

export const RECOVERY_MESSAGE_TIMEOUT_MS = 10_000;
// BE가 recovery.finished 이후에도 처리하지 못했다며 recovery.start를 다시 보내는 횟수 상한
const RECOVERY_MAX_ROUNDS = 3;

interface RecoverRecordingStreamParams {
  recordingSessionId: number;
  waitForRecoveryMessage: (
    recordingSessionId: number,
    types: RecoveryMessage['type'][],
    timeoutMs: number,
  ) => Promise<RecoveryMessage>;
  getChunksToResend: (
    recordingSessionId: number,
    lastProcessedSequence: number,
  ) => Promise<{ seq: number; data: Blob }[]>;
  sendAudioChunk: (recordingSessionId: number, chunk: Blob, seq: number) => void;
  sendRecoveryFinished: (recordingSessionId: number, lastSequence: number) => void;
}

/**
 * recovery.start → 미확인 chunk 재전송 → recovery.finished → stream.ready 순서로 복구한다.
 * stream.ready 대신 recovery.start가 다시 오면 그 순번부터 다시 재전송한다.
 * BE가 마지막으로 처리했다고 알린 순번을 반환한다.
 */
export const recoverRecordingStream = async ({
  recordingSessionId,
  waitForRecoveryMessage,
  getChunksToResend,
  sendAudioChunk,
  sendRecoveryFinished,
}: RecoverRecordingStreamParams) => {
  let message = await waitForRecoveryMessage(
    recordingSessionId,
    ['recovery.start'],
    RECOVERY_MESSAGE_TIMEOUT_MS,
  );

  for (let round = 1; round <= RECOVERY_MAX_ROUNDS; round += 1) {
    if (message.type !== 'recovery.start') break;
    const { lastProcessedSequence } = message;

    const chunks = await getChunksToResend(recordingSessionId, lastProcessedSequence);
    chunks.forEach((chunk) => sendAudioChunk(recordingSessionId, chunk.data, chunk.seq));
    sendRecoveryFinished(recordingSessionId, chunks.at(-1)?.seq ?? lastProcessedSequence);

    const next = await waitForRecoveryMessage(
      recordingSessionId,
      ['recovery.start', 'stream.ready'],
      RECOVERY_MESSAGE_TIMEOUT_MS,
    );
    if (next.type === 'stream.ready') return lastProcessedSequence;
    message = next;
  }

  throw new Error('녹음 복구 요청이 반복됐습니다.');
};
