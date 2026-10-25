const REPLAY_READ_BATCH_SIZE = 50;
const REPLAY_MAX_EMPTY_READS = 3;

interface ReplayRecordingChunksParams {
  recordingSessionId: number;
  fromSequence: number;
  readChunks: (
    recordingSessionId: number,
    fromSeq: number,
    count: number,
  ) => Promise<{ seq: number; data: ArrayBuffer }[]>;
  getLastAppendedSeq: (recordingSessionId: number) => number | null;
  send: (recordingSessionId: number, chunk: ArrayBuffer, seq: number) => void;
  isCancelled: () => boolean;
}

export const replayRecordingChunks = async ({
  recordingSessionId,
  fromSequence,
  readChunks,
  getLastAppendedSeq,
  send,
  isCancelled,
}: ReplayRecordingChunksParams) => {
  let nextSeq = fromSequence;
  let emptyReads = 0;

  for (;;) {
    const chunks = await readChunks(recordingSessionId, nextSeq, REPLAY_READ_BATCH_SIZE);
    if (isCancelled()) return false;

    chunks.forEach((chunk) => {
      send(recordingSessionId, chunk.data, chunk.seq);
      nextSeq = chunk.seq + 1;
    });
    if (chunks.length > 0) {
      emptyReads = 0;
      continue;
    }

    emptyReads += 1;
    const lastAppendedSeq = getLastAppendedSeq(recordingSessionId);
    if (
      lastAppendedSeq === null ||
      lastAppendedSeq < nextSeq ||
      emptyReads >= REPLAY_MAX_EMPTY_READS
    ) {
      return true;
    }
  }
};
