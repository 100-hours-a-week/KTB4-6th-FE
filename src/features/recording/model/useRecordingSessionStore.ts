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
  setActiveRecording: (recording: ActiveRecording) => void;
  clearActiveRecording: (recordingSessionId: number) => void;
  setOperation: (operation: RecordingOperation) => void;
}

export const useRecordingSessionStore = create<RecordingSessionState>((set, get) => ({
  activeRecording: null,
  operation: 'idle',

  setActiveRecording: (recording) => set({ activeRecording: recording }),
  clearActiveRecording: (recordingSessionId) => {
    if (get().activeRecording?.recordingSessionId === recordingSessionId) {
      set({ activeRecording: null });
    }
  },
  setOperation: (operation) => set({ operation }),
}));
