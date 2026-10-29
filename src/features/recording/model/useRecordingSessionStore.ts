'use client';

import { create } from 'zustand';

type RecordingOperation = 'idle' | 'starting' | 'updating' | 'finishing';

interface ActiveRecording {
  teamId: string;
  meetingId: number;
  recordingSessionId: number;
  startedAt: number;
}

interface RecordingSessionState {
  activeRecording: ActiveRecording | null;
  operation: RecordingOperation;
  isPausedByUser: boolean;
  isResumingStream: boolean;
  recordingElsewhereSessionId: number | null;
  setActiveRecording: (recording: ActiveRecording) => void;
  clearActiveRecording: (recordingSessionId: number) => void;
  markRecordingElsewhere: (recordingSessionId: number) => void;
  setOperation: (operation: RecordingOperation) => void;
  setIsPausedByUser: (isPausedByUser: boolean) => void;
  setIsResumingStream: (isResumingStream: boolean) => void;
}

export const useRecordingSessionStore = create<RecordingSessionState>((set, get) => ({
  activeRecording: null,
  operation: 'idle',
  isPausedByUser: false,
  isResumingStream: false,
  recordingElsewhereSessionId: null,

  setActiveRecording: (recording) =>
    set({
      activeRecording: recording,
      isPausedByUser: false,
      isResumingStream: false,
    }),
  clearActiveRecording: (recordingSessionId) => {
    if (get().activeRecording?.recordingSessionId === recordingSessionId) {
      set({
        activeRecording: null,
        isPausedByUser: false,
        isResumingStream: false,
      });
    }
  },
  markRecordingElsewhere: (recordingSessionId) =>
    set({ recordingElsewhereSessionId: recordingSessionId }),
  setOperation: (operation) => set({ operation }),
  setIsPausedByUser: (isPausedByUser) => set({ isPausedByUser }),
  setIsResumingStream: (isResumingStream) => set({ isResumingStream }),
}));
