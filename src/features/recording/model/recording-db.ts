import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export type RecordingChunkStatus = 'pending' | 'acked';

export interface RecordingChunk {
  recordingSessionId: number;
  seq: number;
  partIndex?: number;
  startSample: number;
  status: RecordingChunkStatus;
  createdAt: number;
  data: ArrayBuffer;
}

export interface EncodedFrame {
  recordingSessionId: number;
  timestampUs: number;
  durationUs: number;
  data: ArrayBuffer;
}

export interface EncodingMeta {
  recordingSessionId: number;
  codec: string;
  sampleRate: number;
  numberOfChannels: number;
  description: ArrayBuffer;
}

interface RecordingDB extends DBSchema {
  chunks: {
    key: [number, number];
    value: RecordingChunk;
    indexes: { bySessionStatus: [number, RecordingChunkStatus] };
  };
  encodedFrames: {
    key: [number, number];
    value: EncodedFrame;
  };
  encodingMeta: {
    key: number;
    value: EncodingMeta;
  };
}

const DB_NAME = 'meety-recording';
const DB_VERSION = 2;
export const CHUNK_STORE_NAME = 'chunks';
export const ENCODED_FRAME_STORE_NAME = 'encodedFrames';
export const ENCODING_META_STORE_NAME = 'encodingMeta';

let dbPromise: Promise<IDBPDatabase<RecordingDB>> | null = null;

export const getRecordingDb = () => {
  if (!dbPromise) {
    dbPromise = openDB<RecordingDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore(CHUNK_STORE_NAME, {
            keyPath: ['recordingSessionId', 'seq'],
          });
          store.createIndex('bySessionStatus', ['recordingSessionId', 'status']);
        }
        if (oldVersion < 2) {
          db.createObjectStore(ENCODED_FRAME_STORE_NAME, {
            keyPath: ['recordingSessionId', 'timestampUs'],
          });
          db.createObjectStore(ENCODING_META_STORE_NAME, { keyPath: 'recordingSessionId' });
        }
      },
      blocking() {
        const current = dbPromise;
        dbPromise = null;
        void current?.then((db) => db.close());
      },
      terminated() {
        dbPromise = null;
      },
    }).catch((error: unknown) => {
      dbPromise = null;
      throw error;
    });
  }

  return dbPromise;
};

export const sessionRange = (recordingSessionId: number) =>
  IDBKeyRange.bound([recordingSessionId, -Infinity], [recordingSessionId, Infinity]);

export const isIndexedDbSupported = () => typeof indexedDB !== 'undefined';

export const deleteStaleRecordingChunks = async (maxAgeMs: number, now = Date.now()) => {
  const db = await getRecordingDb();
  const tx = db.transaction(
    [CHUNK_STORE_NAME, ENCODED_FRAME_STORE_NAME, ENCODING_META_STORE_NAME],
    'readwrite',
  );
  const chunkStore = tx.objectStore(CHUNK_STORE_NAME);

  let sessionCursor = await chunkStore.openKeyCursor();
  while (sessionCursor) {
    const [recordingSessionId] = sessionCursor.key;
    const lastChunk = await chunkStore.openCursor(sessionRange(recordingSessionId), 'prev');
    if (lastChunk && now - lastChunk.value.createdAt > maxAgeMs) {
      await chunkStore.delete(sessionRange(recordingSessionId));
      await tx.objectStore(ENCODED_FRAME_STORE_NAME).delete(sessionRange(recordingSessionId));
      await tx.objectStore(ENCODING_META_STORE_NAME).delete(recordingSessionId);
    }
    sessionCursor = await chunkStore.openKeyCursor(
      IDBKeyRange.lowerBound([recordingSessionId, Infinity], true),
    );
  }

  await tx.done;
};
