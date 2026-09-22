'use client';

import { create } from 'zustand';
import type { AudioFormat } from '@/entities/recording';

const supportedFormats: { mimeType: string; audioFormat: AudioFormat }[] = [
  { mimeType: 'audio/webm;codecs=opus', audioFormat: 'webm_opus' },
  { mimeType: 'audio/mp4;codecs=mp4a.40.2', audioFormat: 'mp4_aac' },
];
const AUDIO_CHUNK_INTERVAL_MS = 20;

type MediaRecorderStatus = 'idle' | 'requesting' | 'ready' | 'recording' | 'paused';

interface MediaRecorderState {
  status: MediaRecorderStatus;
  recorder: MediaRecorder | null;
  audioFormat: AudioFormat | null;
  prepare: () => Promise<AudioFormat>;
  start: (onChunk: (chunk: Blob) => void) => void;
  pause: () => void;
  resume: () => void;
  release: () => void;
}

let pendingPreparation: { version: number; promise: Promise<AudioFormat> } | null = null;
let preparationVersion = 0;

export const useMediaRecorder = create<MediaRecorderState>((set, get) => ({
  status: 'idle',
  recorder: null,
  audioFormat: null,

  prepare: () => {
    const { recorder, audioFormat } = get();
    if (recorder && audioFormat) return Promise.resolve(audioFormat);
    if (pendingPreparation?.version === preparationVersion) return pendingPreparation.promise;

    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined' ||
      !MediaRecorder.isTypeSupported
    ) {
      return Promise.reject(new Error('이 브라우저에서는 마이크 녹음을 사용할 수 없습니다.'));
    }

    const format = supportedFormats.find(({ mimeType }) => MediaRecorder.isTypeSupported(mimeType));
    if (!format) {
      return Promise.reject(new Error('지원하는 오디오 녹음 형식이 없습니다.'));
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
        const recorder = new MediaRecorder(stream, { mimeType: format.mimeType });
        set({ recorder, audioFormat: format.audioFormat, status: 'ready' });
        return format.audioFormat;
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

  start: (onChunk) => {
    const { recorder } = get();
    if (!recorder || recorder.state !== 'inactive') return;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) onChunk(event.data);
    };

    try {
      recorder.start(AUDIO_CHUNK_INTERVAL_MS);
    } catch (error) {
      recorder.ondataavailable = null;
      throw error;
    }
    set({ status: 'recording' });
  },

  pause: () => {
    const { recorder } = get();
    if (!recorder || recorder.state !== 'recording') {
      throw new Error('일시정지할 브라우저 녹음이 없습니다.');
    }
    recorder.pause();
    set({ status: 'paused' });
  },

  resume: () => {
    const { recorder } = get();
    if (!recorder || recorder.state !== 'paused') {
      throw new Error('재개할 브라우저 녹음이 없습니다.');
    }
    recorder.resume();
    set({ status: 'recording' });
  },

  release: () => {
    preparationVersion += 1;
    pendingPreparation = null;
    const { recorder } = get();
    set({ recorder: null, audioFormat: null, status: 'idle' });

    if (recorder) {
      try {
        if (recorder.state !== 'inactive') recorder.stop();
      } finally {
        recorder.stream.getTracks().forEach((track) => track.stop());
      }
    }
  },
}));
