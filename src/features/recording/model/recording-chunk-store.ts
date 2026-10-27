import { countPcmSamples } from '@/shared/lib';
import {
  CHUNK_STORE_NAME,
  getRecordingDb,
  sessionRange,
  type RecordingChunk,
} from './recording-db';

export const putRecordingChunk = async (chunk: RecordingChunk) => {
  const db = await getRecordingDb();
  await db.put(CHUNK_STORE_NAME, chunk);
};

export const getNextRecordingChunkPosition = async (recordingSessionId: number) => {
  const db = await getRecordingDb();
  const cursor = await db
    .transaction(CHUNK_STORE_NAME)
    .store.openCursor(sessionRange(recordingSessionId), 'prev');

  if (!cursor) return { seq: 1, startSample: 0 };
  const lastChunk = cursor.value;
  return {
    seq: lastChunk.seq + 1,
    startSample: lastChunk.startSample + countPcmSamples(lastChunk.data),
  };
};

export const getPendingRecordingChunks = async (recordingSessionId: number) => {
  const db = await getRecordingDb();
  return db.getAllFromIndex(CHUNK_STORE_NAME, 'bySessionStatus', [recordingSessionId, 'pending']);
};

export const markRecordingChunksAcked = async (recordingSessionId: number, seq: number) => {
  const db = await getRecordingDb();
  const tx = db.transaction(CHUNK_STORE_NAME, 'readwrite');
  let cursor = await tx.store.index('bySessionStatus').openCursor([recordingSessionId, 'pending']);

  while (cursor && cursor.value.seq <= seq) {
    await cursor.update({ ...cursor.value, status: 'acked' });
    cursor = await cursor.continue();
  }
  await tx.done;
};

export const findRecordingChunkSeqAt = async (recordingSessionId: number, sample: number) => {
  const db = await getRecordingDb();
  let cursor = await db
    .transaction(CHUNK_STORE_NAME)
    .store.openCursor(sessionRange(recordingSessionId), 'prev');

  while (cursor && cursor.value.startSample > sample) cursor = await cursor.continue();
  return cursor?.value.seq ?? null;
};

export const readRecordingChunksFrom = async (
  recordingSessionId: number,
  fromSeq: number,
  untilSeq: number,
  count: number,
) => {
  const db = await getRecordingDb();
  return db.getAll(
    CHUNK_STORE_NAME,
    IDBKeyRange.bound([recordingSessionId, fromSeq], [recordingSessionId, untilSeq], false, true),
    count,
  );
};

export const deleteRecordingChunks = async (recordingSessionId: number) => {
  const db = await getRecordingDb();
  await db.delete(CHUNK_STORE_NAME, sessionRange(recordingSessionId));
};
