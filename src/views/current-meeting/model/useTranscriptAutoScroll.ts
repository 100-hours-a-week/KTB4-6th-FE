'use client';

import { useEffect, useRef, useState } from 'react';
import { getScrollBehaviorByDistance } from '@/shared/lib';

const BOTTOM_THRESHOLD_PX = 80;

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
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: getScrollBehaviorByDistance(distanceFromBottom, container.clientHeight),
    });
  };

  return {
    containerRef,
    unseenCount: isAtBottom ? 0 : Math.max(0, itemCount - countWhenLeftBottom),
    handleScroll,
    scrollToLatest,
  };
};
