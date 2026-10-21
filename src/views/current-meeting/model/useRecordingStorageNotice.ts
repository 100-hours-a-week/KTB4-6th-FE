'use client';

import { useEffect, useRef, useState } from 'react';
import {
  hasEnoughRecordingStorage,
  useRecordingSessionStore,
  useRecordingStorageFailure,
} from '@/features/recording';

export type RecordingStorageNotice = 'low-storage' | 'save-failed';

export const useRecordingStorageNotice = (meetingId: number) => {
  const [notice, setNotice] = useState<RecordingStorageNotice | null>(null);
  const recordingSessionId = useRecordingSessionStore((state) =>
    state.activeRecording?.meetingId === meetingId
      ? state.activeRecording.recordingSessionId
      : null,
  );
  const failedSessionId = useRecordingStorageFailure((state) => state.failedSessionId);
  const checkedSessionIdRef = useRef<number | null>(null);
  const failureNotifiedSessionIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (recordingSessionId === null || checkedSessionIdRef.current === recordingSessionId) return;
    checkedSessionIdRef.current = recordingSessionId;

    let isCancelled = false;
    void hasEnoughRecordingStorage().then((hasEnough) => {
      if (isCancelled || hasEnough) return;
      setNotice((current) => current ?? 'low-storage');
    });
    return () => {
      isCancelled = true;
    };
  }, [recordingSessionId]);

  useEffect(() => {
    if (recordingSessionId === null || failedSessionId !== recordingSessionId) return;
    if (failureNotifiedSessionIdRef.current === recordingSessionId) return;

    failureNotifiedSessionIdRef.current = recordingSessionId;
    setNotice('save-failed');
  }, [failedSessionId, recordingSessionId]);

  const closeNotice = () => setNotice(null);

  return { notice, closeNotice };
};
