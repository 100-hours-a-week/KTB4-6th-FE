'use client';

import { create } from 'zustand';

const REQUIRED_RECORDING_STORAGE_BYTES = 250 * 1024 * 1024;

export const useRecordingStorageFailure = create<{ failedSessionId: number | null }>(() => ({
  failedSessionId: null,
}));

export const markRecordingStorageFailure = (recordingSessionId: number) =>
  useRecordingStorageFailure.setState({ failedSessionId: recordingSessionId });

export const hasEnoughRecordingStorage = async () => {
  if (!navigator.storage?.estimate) return true;

  try {
    const { quota, usage } = await navigator.storage.estimate();
    if (quota === undefined || usage === undefined) return true;
    return quota - usage >= REQUIRED_RECORDING_STORAGE_BYTES;
  } catch {
    return true;
  }
};
