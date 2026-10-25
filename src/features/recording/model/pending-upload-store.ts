import {
  getRecordingDb,
  PENDING_UPLOAD_STORE_NAME,
  type PendingRecordingUpload,
} from './recording-db';

export const putPendingUpload = async (upload: PendingRecordingUpload) => {
  const db = await getRecordingDb();
  await db.put(PENDING_UPLOAD_STORE_NAME, upload);
};

export const getPendingUploads = async () => {
  const db = await getRecordingDb();
  return db.getAll(PENDING_UPLOAD_STORE_NAME);
};

export const deletePendingUpload = async (recordingSessionId: number) => {
  const db = await getRecordingDb();
  await db.delete(PENDING_UPLOAD_STORE_NAME, recordingSessionId);
};
