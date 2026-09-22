'use client';

import { create } from 'zustand';

type MediaRecorderStatus = 'idle' | 'requesting' | 'ready' | 'recording';

interface MediaRecorderState {
  status: MediaRecorderStatus;
  recorder: MediaRecorder | null;
  prepare: () => Promise<void>;
  start: (timeslice?: number) => void;
  release: () => void;
}

let pendingPreparation: { version: number; promise: Promise<void> } | null = null;
let preparationVersion = 0;

export const useMediaRecorder = create<MediaRecorderState>((set, get) => ({
  status: 'idle',
  recorder: null,

  prepare: () => {
    if (get().recorder) return Promise.resolve();
    if (pendingPreparation?.version === preparationVersion) return pendingPreparation.promise;

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      return Promise.reject(new Error('이 브라우저에서는 마이크 녹음을 사용할 수 없습니다.'));
    }

    const version = ++preparationVersion;
    set({ status: 'requesting' });

    const promise = (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (version !== preparationVersion) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error('마이크 준비가 취소되었습니다.');
      }

      try {
        const recorder = new MediaRecorder(stream);
        set({ recorder, status: 'ready' });
      } catch (error) {
        stream.getTracks().forEach((track) => track.stop());
        throw error;
      }
    })()
      .catch((error: unknown) => {
        if (version === preparationVersion) set({ status: 'idle' });
        throw error;
      })
      .finally(() => {
        if (pendingPreparation?.version === version) pendingPreparation = null;
      });

    pendingPreparation = { version, promise };
    return promise;
  },

  start: (timeslice) => {
    const { recorder } = get();
    if (!recorder || recorder.state !== 'inactive') return;
    recorder.start(timeslice);
    set({ status: 'recording' });
  },

  release: () => {
    preparationVersion += 1;
    pendingPreparation = null;
    const { recorder } = get();
    set({ recorder: null, status: 'idle' });

    if (recorder) {
      if (recorder.state !== 'inactive') recorder.stop();
      recorder.stream.getTracks().forEach((track) => track.stop());
    }
  },
}));
