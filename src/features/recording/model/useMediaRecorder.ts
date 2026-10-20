'use client';

import { create } from 'zustand';
import type { AudioFormat } from '@/entities/recording';
import { mergeRecordingPartsToMp4, type ConvertedRecordingFile } from './convert-recording-to-mp4';
import { createPcmCapture, type PcmCapture } from './pcm-capture';

const supportedFormats: { mimeType: string; audioFormat: AudioFormat }[] = [
  { mimeType: 'audio/webm;codecs=opus', audioFormat: 'webm_opus' },
  { mimeType: 'audio/mp4;codecs=mp4a.40.2', audioFormat: 'mp4_aac' },
];
const AUDIO_CHUNK_INTERVAL_MS = 20;

type MediaRecorderStatus = 'idle' | 'requesting' | 'ready' | 'recording' | 'paused';
type RecordingConversionStatus = 'idle' | 'loading' | 'converting' | 'success' | 'error';

interface MediaRecorderState {
  status: MediaRecorderStatus;
  recorder: MediaRecorder | null;
  capture: PcmCapture | null;
  audioFormat: AudioFormat | null;
  isFlushing: boolean;
  conversionStatus: RecordingConversionStatus;
  conversionProgress: number;
  conversionError: string | null;
  prepare: () => Promise<AudioFormat>;
  start: (onChunk: (chunk: Blob) => void) => void;
  pause: () => void;
  resume: () => void;
  flush: () => Promise<void>;
  convertToMp4: (parts: Blob[], fileName: string) => Promise<ConvertedRecordingFile>;
  release: () => void;
}

let pendingPreparation: { version: number; promise: Promise<AudioFormat> } | null = null;
let preparationVersion = 0;

export const useMediaRecorder = create<MediaRecorderState>((set, get) => ({
  status: 'idle',
  recorder: null,
  capture: null,
  audioFormat: null,
  isFlushing: false,
  conversionStatus: 'idle',
  conversionProgress: 0,
  conversionError: null,

  prepare: () => {
    const { capture, audioFormat } = get();
    if (capture && audioFormat) return Promise.resolve(audioFormat);
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
        const capture = await createPcmCapture(stream);

        if (version !== preparationVersion) {
          void capture.context.close();
          throw new Error('마이크 준비가 취소되었습니다.');
        }

        set({ capture, audioFormat: format.audioFormat, status: 'ready' });
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
      if (event.data.size > 0 && (recorder.state === 'recording' || get().isFlushing)) {
        onChunk(event.data);
      }
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

  flush: async () => {
    const { recorder } = get();
    if (!recorder || recorder.state === 'inactive') {
      throw new Error('마무리할 브라우저 녹음이 없습니다.');
    }

    const waitForEvent = (eventName: 'pause' | 'dataavailable', action: () => void) =>
      new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          recorder.removeEventListener(eventName, onExpected);
          recorder.removeEventListener('error', onFailure);
          recorder.removeEventListener('stop', onFailure);
        };
        const onExpected = () => {
          cleanup();
          resolve();
        };
        const onFailure = () => {
          cleanup();
          reject(new Error('브라우저 녹음 데이터를 마무리하지 못했습니다.'));
        };

        recorder.addEventListener(eventName, onExpected);
        recorder.addEventListener('error', onFailure);
        recorder.addEventListener('stop', onFailure);
        try {
          action();
        } catch (error) {
          cleanup();
          reject(error);
        }
      });

    set({ isFlushing: true });
    try {
      if (recorder.state === 'recording') {
        await waitForEvent('pause', () => recorder.pause());
        set({ status: 'paused' });
      }

      await waitForEvent('dataavailable', () => recorder.requestData());
    } finally {
      set({ isFlushing: false });
    }
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
    const { recorder } = get();
    set({
      recorder: null,
      audioFormat: null,
      isFlushing: false,
      status: 'idle',
      conversionStatus: 'idle',
      conversionProgress: 0,
      conversionError: null,
    });

    if (recorder) {
      try {
        recorder.ondataavailable = null;
        if (recorder.state !== 'inactive') recorder.stop();
      } finally {
        recorder.stream.getTracks().forEach((track) => track.stop());
      }
    }
  },
}));
