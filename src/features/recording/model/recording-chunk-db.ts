import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

/**
 * BE가 chunk를 받았다고 확인(ACK)했는지.
 * 보냈어도 연결이 끊기면 BE에 닿지 않을 수 있어서, 전송 여부가 아니라 수신 확인 여부로 구분한다.
 * 저장할 때는 항상 pending이고, ACK를 받으면 acked로 바꾼다.
 */
export type RecordingChunkStatus = 'pending' | 'acked';

export interface RecordingChunk {
  recordingSessionId: number;
  seq: number;
  partIndex: number;
  status: RecordingChunkStatus;
  createdAt: number;
  data: Blob;
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
      // 다른 탭이 새 버전으로 열려고 하면 이 연결이 업그레이드를 막지 않도록 닫는다.
      // 다음 접근 때 새 버전으로 다시 연다.
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

/** 이 세션의 chunk 전체를 가리키는 키 범위. */
const sessionRange = (recordingSessionId: number) =>
  IDBKeyRange.bound([recordingSessionId, -Infinity], [recordingSessionId, Infinity]);

export const isIndexedDbSupported = () => typeof indexedDB !== 'undefined';

export const putRecordingChunk = async (chunk: RecordingChunk) => {
  const db = await getDb();
  await db.put(STORE_NAME, chunk);
};

/**
 * 세션 마지막 chunk를 뒤에서부터 하나만 읽어 다음 seq·partIndex 반환, 없으면 (0, 0)
 */
export const getNextRecordingChunkPosition = async (recordingSessionId: number) => {
  const db = await getDb();
  const cursor = await db
    .transaction(STORE_NAME)
    .store.openCursor(sessionRange(recordingSessionId), 'prev');

  if (!cursor) return { seq: 0, partIndex: 0 };
  return { seq: cursor.value.seq + 1, partIndex: cursor.value.partIndex + 1 };
};

/** 이 세션의 chunk를 순번대로 읽어, 녹음 객체(part)별로 이어 붙인 Blob 배열로 반환한다. */
export const readRecordingChunkParts = async (recordingSessionId: number): Promise<Blob[]> => {
  const db = await getDb();
  const chunks = await db.getAll(STORE_NAME, sessionRange(recordingSessionId));

  const parts: Blob[][] = [];
  let currentPartIndex: number | null = null;
  for (const chunk of chunks) {
    if (chunk.partIndex !== currentPartIndex) {
      parts.push([]);
      currentPartIndex = chunk.partIndex;
    }
    parts[parts.length - 1].push(chunk.data);
  }

  return parts.map((partChunks) => new Blob(partChunks));
};

/** 이 세션에서 BE 수신 확인을 받지 못한 chunk를 순번대로 반환한다. 재전송 대상이다. */
export const getPendingRecordingChunks = async (recordingSessionId: number) => {
  const db = await getDb();
  return db.getAllFromIndex(STORE_NAME, 'bySessionStatus', [recordingSessionId, 'pending']);
};

export const deleteRecordingChunks = async (recordingSessionId: number) => {
  const db = await getDb();
  await db.delete(STORE_NAME, sessionRange(recordingSessionId));
};

/**
 * 마지막 chunk가 maxAgeMs보다 오래된 세션의 chunk를 지운다.
 * 업로드까지 끝내지 못한 채 남은 세션을 치우는 용도라, 진행 중일 수 있는 세션은 건드리지 않도록
 * 녹음 최대 시간보다 충분히 긴 기준을 넘긴다.
 */
export const deleteStaleRecordingChunks = async (maxAgeMs: number, now = Date.now()) => {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');

  // 세션별로 가장 앞 chunk 키를 찾아 다음 세션으로 건너뛰며 순회한다.
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
