'use client';

import { useEffect, useRef, useState } from 'react';

// 맨 아래에서 이 거리 안이면 "최신 발화를 보고 있는 상태"로 본다.
const BOTTOM_THRESHOLD_PX = 80;

/**
 * 새 녹취가 추가되면 맨 아래로 따라가되, 사용자가 위로 올라가 읽는 중이면 화면을 빼앗지 않는다.
 * 읽는 중에 쌓인 새 녹취 수는 unseenCount로 알려주고, scrollToLatest로 최신 위치로 돌아간다.
 */
export const useTranscriptAutoScroll = (itemCount: number) => {
  const containerRef = useRef<HTMLElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [countWhenLeftBottom, setCountWhenLeftBottom] = useState(itemCount);

  useEffect(() => {
    if (!isAtBottom) return;

    const container = containerRef.current;
    container?.scrollTo({ top: container.scrollHeight });
  }, [itemCount, isAtBottom]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const nextIsAtBottom = distanceFromBottom <= BOTTOM_THRESHOLD_PX;

    if (nextIsAtBottom === isAtBottom) return;

    setIsAtBottom(nextIsAtBottom);
    if (!nextIsAtBottom) setCountWhenLeftBottom(itemCount);
  };

  const scrollToLatest = () => {
    const container = containerRef.current;
    container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  };

  return {
    containerRef,
    unseenCount: isAtBottom ? 0 : Math.max(0, itemCount - countWhenLeftBottom),
    handleScroll,
    scrollToLatest,
  };
};
