import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { countPcmSamples } from './pcm-capture';

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

interface RecordingChunkDB extends DBSchema {
  chunks: {
    key: [number, number];
    value: RecordingChunk;
    indexes: { bySessionStatus: [number, RecordingChunkStatus] };
  };
}

const DB_NAME = 'meety-recording';
const DB_VERSION = 1;
const STORE_NAME = 'chunks';

let dbPromise: Promise<IDBPDatabase<RecordingChunkDB>> | null = null;

const getDb = () => {
  if (!dbPromise) {
    dbPromise = openDB<RecordingChunkDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: ['recordingSessionId', 'seq'],
        });
        store.createIndex('bySessionStatus', ['recordingSessionId', 'status']);
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

const sessionRange = (recordingSessionId: number) =>
  IDBKeyRange.bound([recordingSessionId, -Infinity], [recordingSessionId, Infinity]);

export const isIndexedDbSupported = () => typeof indexedDB !== 'undefined';

export const putRecordingChunk = async (chunk: RecordingChunk) => {
  const db = await getDb();
  await db.put(STORE_NAME, chunk);
};

export const getNextRecordingChunkPosition = async (recordingSessionId: number) => {
  const db = await getDb();
  const cursor = await db
    .transaction(STORE_NAME)
    .store.openCursor(sessionRange(recordingSessionId), 'prev');

  if (!cursor) return { seq: 1, startSample: 0 };
  const lastChunk = cursor.value;
  return {
    seq: lastChunk.seq + 1,
    startSample: lastChunk.startSample + countPcmSamples(lastChunk.data),
  };
};

export const readRecordingChunkParts = async (recordingSessionId: number): Promise<Blob[]> => {
  const db = await getDb();
  const chunks = await db.getAll(STORE_NAME, sessionRange(recordingSessionId));

  const parts: BlobPart[][] = [];
  let currentPartIndex: number | null | undefined = null;
  for (const chunk of chunks) {
    if (chunk.partIndex !== currentPartIndex) {
      parts.push([]);
      currentPartIndex = chunk.partIndex;
    }
    parts[parts.length - 1].push(chunk.data);
  }

  return parts.map((partChunks) => new Blob(partChunks));
};

export const getPendingRecordingChunks = async (recordingSessionId: number) => {
  const db = await getDb();
  return db.getAllFromIndex(STORE_NAME, 'bySessionStatus', [recordingSessionId, 'pending']);
};

export const markRecordingChunksAcked = async (recordingSessionId: number, seq: number) => {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  let cursor = await tx.store.index('bySessionStatus').openCursor([recordingSessionId, 'pending']);

  while (cursor && cursor.value.seq <= seq) {
    await cursor.update({ ...cursor.value, status: 'acked' });
    cursor = await cursor.continue();
  }
  await tx.done;
};

export const deleteRecordingChunks = async (recordingSessionId: number) => {
  const db = await getDb();
  await db.delete(STORE_NAME, sessionRange(recordingSessionId));
};

export const deleteStaleRecordingChunks = async (maxAgeMs: number, now = Date.now()) => {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');

  let sessionCursor = await tx.store.openKeyCursor();
  while (sessionCursor) {
    const [recordingSessionId] = sessionCursor.key;
    const lastChunk = await tx.store.openCursor(sessionRange(recordingSessionId), 'prev');
    if (lastChunk && now - lastChunk.value.createdAt > maxAgeMs) {
      await tx.store.delete(sessionRange(recordingSessionId));
    }
    sessionCursor = await tx.store.openKeyCursor(
      IDBKeyRange.lowerBound([recordingSessionId, Infinity], true),
    );
  }

  await tx.done;
};
