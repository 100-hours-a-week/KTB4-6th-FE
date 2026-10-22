'use client';

import { create } from 'zustand';
import type { AudioFormat } from '@/entities/recording';
import { ensureAacEncodingSupported } from './aac-encoder';
import { UnsupportedRecordingBrowserError } from './errors';
import {
  createPcmCapture,
  flushPcmCapture,
  releasePcmCapture,
  resumePcmCapture,
  startPcmCapture,
  PCM_AUDIO_FORMAT,
  type PcmCapture,
} from './pcm-capture';

type MediaRecorderStatus = 'idle' | 'requesting' | 'ready' | 'recording' | 'paused';

interface MediaRecorderState {
  status: MediaRecorderStatus;
  capture: PcmCapture | null;
  audioFormat: AudioFormat | null;
  prepare: () => Promise<AudioFormat>;
  start: (onChunk: (chunk: ArrayBuffer) => void) => void;
  resume: () => void;
  flush: () => Promise<void>;
  release: () => void;
}

let pendingPreparation: { version: number; promise: Promise<AudioFormat> } | null = null;
let preparationVersion = 0;

export const useMediaRecorder = create<MediaRecorderState>((set, get) => ({
  status: 'idle',
  capture: null,
  audioFormat: null,

  prepare: () => {
    const { capture, audioFormat } = get();
    if (capture && audioFormat) return Promise.resolve(audioFormat);
    if (pendingPreparation?.version === preparationVersion) return pendingPreparation.promise;

    if (!navigator.mediaDevices?.getUserMedia) {
      return Promise.reject(new UnsupportedRecordingBrowserError());
    }

    const version = ++preparationVersion;
    set({ status: 'requesting' });

    const promise = (async () => {
      await ensureAacEncodingSupported();
      if (version !== preparationVersion) throw new Error('마이크 준비가 취소되었습니다.');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (version !== preparationVersion) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error('마이크 준비가 취소되었습니다.');
      }

      try {
        const capture = await createPcmCapture(stream);

        if (version !== preparationVersion) {
          void capture.context.close();
          throw new Error('마이크 준비가 취소되었습니다.');
        }

        set({ capture, audioFormat: PCM_AUDIO_FORMAT, status: 'ready' });
        return PCM_AUDIO_FORMAT;
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
    const { capture, status } = get();
    if (!capture || status !== 'ready') return;

    startPcmCapture(capture, onChunk);
    set({ status: 'recording' });
  },

  resume: () => {
    const { capture, status } = get();
    if (!capture || status !== 'paused') {
      throw new Error('재개할 브라우저 녹음이 없습니다.');
    }
    resumePcmCapture(capture);
    set({ status: 'recording' });
  },

  flush: async () => {
    const { capture, status } = get();
    if (!capture || (status !== 'recording' && status !== 'paused')) {
      throw new Error('마무리할 브라우저 녹음이 없습니다.');
    }

    await flushPcmCapture(capture);
    set({ status: 'paused' });
  },

  release: () => {
    preparationVersion += 1;
    pendingPreparation = null;
    const { capture } = get();
    set({
      capture: null,
      audioFormat: null,
      status: 'idle',
    });

    if (capture) releasePcmCapture(capture);
  },
}));
