'use client';

import { useEffect, useRef, useState } from 'react';

// 음성 주소(URL) 또는 음성 파일 자체
type AudioSource = string | Blob;

/**
 * 음성을 재생하고 재생 상태와 현재 재생 위치(ms)를 알려준다.
 * audioSource가 null이면 재생할 수 없고, 값이 바뀌거나 사용이 끝나면 재생을 멈추고 정리한다.
 */
export const useAudioPlayer = (audioSource: AudioSource | null) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);

  useEffect(() => {
    if (!audioSource) return;

    // Blob이면 재생용 임시 주소를 만들고, 정리할 때 함께 해제한다.
    const isObjectUrl = typeof audioSource !== 'string';
    const src = isObjectUrl ? URL.createObjectURL(audioSource) : audioSource;
    const audio = new Audio(src);
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadStart = () => {
      setIsPlaying(false);
      setCurrentMs(0);
    };
    // 재생할 수 있는지는 음성 정보를 불러온 뒤에 알 수 있어, 서버 렌더링과 첫 렌더는 항상 false다.
    const handleLoadedMetadata = () => setIsReady(true);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentMs(Math.round(audio.currentTime * 1000));

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
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

  return { isPlaying, currentMs, canPlay: isReady, togglePlay };
};
