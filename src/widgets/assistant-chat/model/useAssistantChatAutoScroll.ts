'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { AssistantChatMessage } from './types';

const BOTTOM_THRESHOLD_PX = 80;
const INDICATOR_HEIGHT_PX = 60;
const INDICATOR_INSET_PX = 16;

export const useAssistantChatAutoScroll = (messages: AssistantChatMessage[]) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const isAtBottomRef = useRef(true);
  const lastMessage = messages.at(-1);
  const lastUserMessageId = messages.findLast((message) => message.role === 'user')?.id;

  const updateIndicator = useCallback(() => {
    const container = containerRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return;

    const scrollRange = container.scrollHeight - container.clientHeight;
    if (scrollRange <= 0) {
      indicator.style.opacity = '0';
      return;
    }

    const trackLength = container.clientHeight - INDICATOR_INSET_PX * 2 - INDICATOR_HEIGHT_PX;
    const offset = INDICATOR_INSET_PX + (container.scrollTop / scrollRange) * trackLength;
    indicator.style.opacity = '1';
    indicator.style.transform = `translateY(${offset}px)`;
  }, []);

  const setContainer = useCallback(
    (element: HTMLDivElement | null) => {
      containerRef.current = element;
      if (!element) return;

      isAtBottomRef.current = true;
      element.scrollTop = element.scrollHeight;
      updateIndicator();
    },
    [updateIndicator],
  );

  useEffect(() => {
    isAtBottomRef.current = true;
  }, [lastUserMessageId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isAtBottomRef.current) container.scrollTo({ top: container.scrollHeight });
    updateIndicator();
  }, [messages.length, lastMessage?.text, updateIndicator]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    isAtBottomRef.current = distanceFromBottom <= BOTTOM_THRESHOLD_PX;
    updateIndicator();
  };

  return { setContainer, indicatorRef, handleScroll };
};
