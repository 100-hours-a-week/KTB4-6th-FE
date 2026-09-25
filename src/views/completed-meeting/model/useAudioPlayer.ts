'use client';

import { useEffect, useRef, useState } from 'react';

// 음성 주소(URL) 또는 음성 파일 자체
type AudioSource = string | Blob;

interface UseAudioPlayerOptions {
  /** 음성을 불러오거나 재생하다 실패했을 때 호출한다. 예: 재생 주소가 만료됨 */
  onError?: () => void;
}

// 음성 주소가 바뀌어 새로 불러올 때 이어서 재생하려고 기억해 두는 상태
interface ResumeState {
  ms: number;
  shouldPlay: boolean;
  isMuted: boolean;
}

/**
 * 음성을 재생하고 재생 상태와 현재 재생 위치(ms)를 알려준다.
 * audioSource가 null이면 재생할 수 없고, 사용이 끝나면 재생을 멈추고 정리한다.
 * 재생 중에 audioSource가 다른 주소로 바뀌면(주소 재발급) 같은 위치·재생 상태·음소거로 이어서 재생한다.
 *
 * 재생 위치 탐색은 두 가지다. seek는 바로 이동하고, 진행 바를 끄는 동안은 scrub으로 위치만 미리 보여준 뒤
 * 손을 뗄 때 한 번만 이동한다. displayMs는 화면에 보여줄 위치라 끄는 중에는 끄는 위치를 가리킨다.
 */
export const useAudioPlayer = (
  audioSource: AudioSource | null,
  { onError }: UseAudioPlayerOptions = {},
) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onErrorRef = useRef(onError);
  const resumeRef = useRef<ResumeState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  const [scrubMs, setScrubMs] = useState<number | null>(null);

  useEffect(() => {
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!audioSource) return;

    const resume = resumeRef.current;
    resumeRef.current = null;

    // Blob이면 재생용 임시 주소를 만들고, 정리할 때 함께 해제한다.
    const isObjectUrl = typeof audioSource !== 'string';
    const src = isObjectUrl ? URL.createObjectURL(audioSource) : audioSource;
    const audio = new Audio(src);
    audio.preload = 'metadata';
    if (resume) audio.muted = resume.isMuted;
    audioRef.current = audio;

    const handleLoadStart = () => {
      setIsPlaying(false);
      setIsMuted(audio.muted);
      if (!resume) setCurrentMs(0);
      setScrubMs(null);
    };
    // 재생할 수 있는지는 음성 정보를 불러온 뒤에 알 수 있어, 서버 렌더링과 첫 렌더는 항상 false다.
    const handleLoadedMetadata = () => {
      setIsReady(true);
      if (!resume) return;

      audio.currentTime = resume.ms / 1000;
      if (resume.shouldPlay) audio.play().catch(() => {});
    };
    const handleError = () => onErrorRef.current?.();
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setIsMuted(audio.muted);
    const handleTimeUpdate = () => setCurrentMs(Math.round(audio.currentTime * 1000));

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handlePause);
    audio.addEventListener('volumechange', handleVolumeChange);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleError);

    return () => {
      // 주소가 바뀌어 다시 불러올 때 이어서 재생하도록 지금 상태를 기억해 둔다.
      resumeRef.current = {
        ms: Math.round(audio.currentTime * 1000),
        shouldPlay: !audio.paused && !audio.ended,
        isMuted: audio.muted,
      };
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handlePause);
      audio.removeEventListener('volumechange', handleVolumeChange);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
      setIsReady(false);
      if (isObjectUrl) URL.revokeObjectURL(src);
    };
  }, [audioSource]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      // 재생 요청이 중간에 끊겨도(예: 곧바로 일시정지) 상태는 play/pause 이벤트로 맞춘다.
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  // 재생 중이 아니어도 화면의 위치가 바로 바뀌도록 timeupdate를 기다리지 않고 현재 위치를 함께 갱신한다.
  const seek = (ms: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = ms / 1000;
    setCurrentMs(ms);
  };

  const beginScrub = (ms: number) => setScrubMs(ms);

  const updateScrub = (ms: number) => setScrubMs(ms);

  const endScrub = () => {
    if (scrubMs !== null) seek(scrubMs);
    setScrubMs(null);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
  };

  return {
    isPlaying,
    isMuted,
    canPlay: isReady,
    currentMs,
    displayMs: scrubMs ?? currentMs,
    togglePlay,
    seek,
    beginScrub,
    updateScrub,
    endScrub,
    toggleMute,
  };
};
