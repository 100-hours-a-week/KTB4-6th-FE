import type { FFmpeg } from '@ffmpeg/ffmpeg';

const FFMPEG_CORE_BASE_URL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd';
const AUDIO_BITRATE = '128k';
const AUDIO_METADATA_TIMEOUT_MS = 10_000;

interface ConvertRecordingToMp4Options {
  fileName: string;
  onReady?: () => void;
  onProgress?: (progress: number) => void;
}

export interface ConvertedRecordingFile {
  file: File;
  durationMs: number;
}

let ffmpegPromise: Promise<FFmpeg> | null = null;

const loadFfmpeg = () => {
  if (!ffmpegPromise) {
    ffmpegPromise = Promise.all([import('@ffmpeg/ffmpeg'), import('@ffmpeg/util')])
      .then(async ([{ FFmpeg }, { toBlobURL }]) => {
        const ffmpeg = new FFmpeg();
        await ffmpeg.load({
          coreURL: await toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        return ffmpeg;
      })
      .catch((error: unknown) => {
        ffmpegPromise = null;
        throw error;
      });
  }

  return ffmpegPromise;
};

const readAudioDuration = (file: File) =>
  new Promise<number>((resolve, reject) => {
    const audio = document.createElement('audio');
    const objectUrl = URL.createObjectURL(file);
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error('변환된 녹음 파일의 재생 시간을 확인하지 못했습니다.'));
    }, AUDIO_METADATA_TIMEOUT_MS);

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      audio.onloadedmetadata = null;
      audio.onerror = null;
      audio.removeAttribute('src');
      audio.load();
      URL.revokeObjectURL(objectUrl);
    };

    audio.onloadedmetadata = () => {
      const durationMs = Math.round(audio.duration * 1000);
      cleanup();

      if (!Number.isFinite(durationMs) || durationMs <= 0) {
        reject(new Error('변환된 녹음 파일의 재생 시간이 올바르지 않습니다.'));
        return;
      }

      resolve(durationMs);
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error('변환된 녹음 파일을 읽지 못했습니다.'));
    };
    audio.preload = 'metadata';
    audio.src = objectUrl;
  });

const createMp4File = async (data: BlobPart, fileName: string) => {
  const file = new File([data], fileName, { type: 'audio/mp4', lastModified: Date.now() });
  const durationMs = await readAudioDuration(file);
  return { file, durationMs };
};

export const convertRecordingToMp4 = async (
  source: Blob,
  { fileName, onReady, onProgress }: ConvertRecordingToMp4Options,
): Promise<ConvertedRecordingFile> => {
  if (source.size === 0) throw new Error('변환할 녹음 파일이 비어 있습니다.');

  if (source.type.startsWith('audio/mp4')) {
    onReady?.();
    onProgress?.(1);
    return createMp4File(source, fileName);
  }

  const ffmpeg = await loadFfmpeg();
  onReady?.();

  const inputName = 'recording-input.webm';
  const outputName = 'recording-output.mp4';
  const handleProgress = ({ progress }: { progress: number }) => {
    if (Number.isFinite(progress)) onProgress?.(Math.min(1, Math.max(0, progress)));
  };
  const deleteFile = async (path: string) => {
    try {
      await ffmpeg.deleteFile(path);
    } catch {
      // 변환 도중 파일이 생성되지 않았으면 정리할 파일도 없다.
    }
  };

  ffmpeg.on('progress', handleProgress);
  try {
    const { fetchFile } = await import('@ffmpeg/util');
    await ffmpeg.writeFile(inputName, await fetchFile(source));
    const exitCode = await ffmpeg.exec([
      '-i',
      inputName,
      '-vn',
      '-c:a',
      'aac',
      '-b:a',
      AUDIO_BITRATE,
      '-movflags',
      '+faststart',
      outputName,
    ]);
    if (exitCode !== 0) throw new Error('녹음 파일을 MP4로 변환하지 못했습니다.');

    const output = await ffmpeg.readFile(outputName);
    if (typeof output === 'string') throw new Error('변환된 녹음 파일 형식이 올바르지 않습니다.');

    const bytes = new Uint8Array(output.byteLength);
    bytes.set(output);
    onProgress?.(1);
    return createMp4File(bytes.buffer, fileName);
  } finally {
    ffmpeg.off('progress', handleProgress);
    await Promise.all([deleteFile(inputName), deleteFile(outputName)]);
  }
};
