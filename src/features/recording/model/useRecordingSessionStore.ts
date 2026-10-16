'use client';

import { create } from 'zustand';
import type { AudioFileUploadTarget } from '../api/create-audio-file-upload-url';

type RecordingOperation = 'idle' | 'starting' | 'updating' | 'finishing';

interface ActiveRecording {
  teamId: string;
  meetingId: number;
  recordingSessionId: number;
  startedAt: number;
}

interface PendingRecordingUpload extends AudioFileUploadTarget {
  recordingSessionId: number;
  isCompleted: boolean;
}

interface RecordingSessionState {
  activeRecording: ActiveRecording | null;
  pendingUpload: PendingRecordingUpload | null;
  operation: RecordingOperation;
  isPausedByUser: boolean;
  isResumingStream: boolean;
  setActiveRecording: (recording: ActiveRecording) => void;
  clearActiveRecording: (recordingSessionId: number) => void;
  setPendingUpload: (upload: PendingRecordingUpload) => void;
  markPendingUploadCompleted: (recordingSessionId: number) => void;
  setOperation: (operation: RecordingOperation) => void;
  setIsPausedByUser: (isPausedByUser: boolean) => void;
  setIsResumingStream: (isResumingStream: boolean) => void;
}

export const useRecordingSessionStore = create<RecordingSessionState>((set, get) => ({
  activeRecording: null,
  pendingUpload: null,
  operation: 'idle',
  isPausedByUser: false,
  isResumingStream: false,

  setActiveRecording: (recording) =>
    set({
      activeRecording: recording,
      pendingUpload: null,
      isPausedByUser: false,
      isResumingStream: false,
    }),
  clearActiveRecording: (recordingSessionId) => {
    if (get().activeRecording?.recordingSessionId === recordingSessionId) {
      set({
        activeRecording: null,
        pendingUpload: null,
        isPausedByUser: false,
        isResumingStream: false,
      });
    }
  },
  setPendingUpload: (pendingUpload) => set({ pendingUpload }),
  markPendingUploadCompleted: (recordingSessionId) => {
    const { pendingUpload } = get();
    if (pendingUpload?.recordingSessionId === recordingSessionId) {
      set({ pendingUpload: { ...pendingUpload, isCompleted: true } });
    }
  },
  setOperation: (operation) => set({ operation }),
  setIsPausedByUser: (isPausedByUser) => set({ isPausedByUser }),
  setIsResumingStream: (isResumingStream) => set({ isResumingStream }),
}));
