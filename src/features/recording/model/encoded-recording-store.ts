import {
  ENCODED_FRAME_STORE_NAME,
  ENCODING_META_STORE_NAME,
  getRecordingDb,
  sessionRange,
  type EncodedFrame,
  type EncodingMeta,
} from './recording-db';

export const putEncodedFrames = async (frames: EncodedFrame[]) => {
  const db = await getRecordingDb();
  const tx = db.transaction(ENCODED_FRAME_STORE_NAME, 'readwrite');
  await Promise.all([...frames.map((frame) => tx.store.put(frame)), tx.done]);
};

export const getEncodedFramesEndUs = async (recordingSessionId: number) => {
  const db = await getRecordingDb();
  const cursor = await db
    .transaction(ENCODED_FRAME_STORE_NAME)
    .store.openCursor(sessionRange(recordingSessionId), 'prev');

  if (!cursor) return 0;
  return cursor.value.timestampUs + cursor.value.durationUs;
};

export const putEncodingMeta = async (meta: EncodingMeta) => {
  const db = await getRecordingDb();
  await db.put(ENCODING_META_STORE_NAME, meta);
};

export const getEncodingMeta = async (recordingSessionId: number) => {
  const db = await getRecordingDb();
  return db.get(ENCODING_META_STORE_NAME, recordingSessionId);
};

export const deleteEncodedRecording = async (recordingSessionId: number) => {
  const db = await getRecordingDb();
  const tx = db.transaction([ENCODED_FRAME_STORE_NAME, ENCODING_META_STORE_NAME], 'readwrite');
  await Promise.all([
    tx.objectStore(ENCODED_FRAME_STORE_NAME).delete(sessionRange(recordingSessionId)),
    tx.objectStore(ENCODING_META_STORE_NAME).delete(recordingSessionId),
    tx.done,
  ]);
};
