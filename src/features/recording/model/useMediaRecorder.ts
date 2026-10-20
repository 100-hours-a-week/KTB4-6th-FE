'use client';

import { create } from 'zustand';
import type { AudioFormat } from '@/entities/recording';
import { mergeRecordingPartsToMp4, type ConvertedRecordingFile } from './convert-recording-to-mp4';
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
type RecordingConversionStatus = 'idle' | 'loading' | 'converting' | 'success' | 'error';

interface MediaRecorderState {
  status: MediaRecorderStatus;
  capture: PcmCapture | null;
  audioFormat: AudioFormat | null;
  conversionStatus: RecordingConversionStatus;
  conversionProgress: number;
  conversionError: string | null;
  prepare: () => Promise<AudioFormat>;
  start: (onChunk: (chunk: Blob) => void) => void;
  resume: () => void;
  flush: () => Promise<void>;
  convertToMp4: (parts: Blob[], fileName: string) => Promise<ConvertedRecordingFile>;
  release: () => void;
}

let pendingPreparation: { version: number; promise: Promise<AudioFormat> } | null = null;
let preparationVersion = 0;

export const useMediaRecorder = create<MediaRecorderState>((set, get) => ({
  status: 'idle',
  capture: null,
  audioFormat: null,
  conversionStatus: 'idle',
  conversionProgress: 0,
  conversionError: null,

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

    startPcmCapture(capture, (chunk) => onChunk(new Blob([chunk])));
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

  convertToMp4: async (parts, fileName) => {
    set({ conversionStatus: 'loading', conversionProgress: 0, conversionError: null });

    try {
      const convertedFile = await mergeRecordingPartsToMp4(parts, {
        fileName,
        onReady: () => set({ conversionStatus: 'converting' }),
        onProgress: (conversionProgress) => set({ conversionProgress }),
      });
      set({ conversionStatus: 'success', conversionProgress: 1 });
      return convertedFile;
    } catch (error) {
      const message = error instanceof Error ? error.message : '녹음 파일 변환에 실패했습니다.';
      set({ conversionStatus: 'error', conversionError: message });
      throw error;
    }
  },

  release: () => {
    preparationVersion += 1;
    pendingPreparation = null;
    const { capture } = get();
    set({
      capture: null,
      audioFormat: null,
      status: 'idle',
      conversionStatus: 'idle',
      conversionProgress: 0,
      conversionError: null,
    });

    if (capture) releasePcmCapture(capture);
  },
}));
