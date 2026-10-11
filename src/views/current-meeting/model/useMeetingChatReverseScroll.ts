'use client';

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

interface UseMeetingChatReverseScrollOptions {
  messageCount: number;
  isInitialLoading: boolean;
  hasOlderMessages: boolean;
  isLoadingOlderMessages: boolean;
  hasLoadingOlderMessagesError: boolean;
  onLoadOlderMessages: () => Promise<unknown>;
}

export const useMeetingChatReverseScroll = ({
  messageCount,
  isInitialLoading,
  hasOlderMessages,
  isLoadingOlderMessages,
  hasLoadingOlderMessagesError,
  onLoadOlderMessages,
}: UseMeetingChatReverseScrollOptions) => {
  const scrollContainerRef = useRef<HTMLElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const hasPositionedInitiallyRef = useRef(false);
  const isLoadRequestedRef = useRef(false);
  const isPrependingRef = useRef(false);
  const previousMessageCountRef = useRef(0);
  const previousScrollHeightRef = useRef(0);
  const previousScrollTopRef = useRef(0);

  const loadOlderMessages = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;

    if (
      !scrollContainer ||
      !hasOlderMessages ||
      isLoadingOlderMessages ||
      isLoadRequestedRef.current
    ) {
      return;
    }

    previousMessageCountRef.current = messageCount;
    previousScrollHeightRef.current = scrollContainer.scrollHeight;
    previousScrollTopRef.current = scrollContainer.scrollTop;
    isPrependingRef.current = true;
    isLoadRequestedRef.current = true;

    void onLoadOlderMessages()
      .catch(() => undefined)
      .finally(() => {
        isLoadRequestedRef.current = false;
      });
  }, [hasOlderMessages, isLoadingOlderMessages, messageCount, onLoadOlderMessages]);

  useLayoutEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || isInitialLoading || messageCount === 0) return;

    if (!hasPositionedInitiallyRef.current) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
      hasPositionedInitiallyRef.current = true;
      return;
    }

    if (!isPrependingRef.current || isLoadingOlderMessages) return;

    if (messageCount > previousMessageCountRef.current) {
      const addedHeight = scrollContainer.scrollHeight - previousScrollHeightRef.current;
      scrollContainer.scrollTop = previousScrollTopRef.current + addedHeight;
    }

    isPrependingRef.current = false;
  }, [isInitialLoading, isLoadingOlderMessages, messageCount]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const topSentinel = topSentinelRef.current;

    if (
      !scrollContainer ||
      !topSentinel ||
      isInitialLoading ||
      !hasOlderMessages ||
      isLoadingOlderMessages ||
      hasLoadingOlderMessagesError
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadOlderMessages();
      },
      { root: scrollContainer, threshold: 0 },
    );

    observer.observe(topSentinel);
    return () => observer.disconnect();
  }, [
    hasLoadingOlderMessagesError,
    hasOlderMessages,
    isInitialLoading,
    isLoadingOlderMessages,
    loadOlderMessages,
  ]);

  return {
    scrollContainerRef,
    topSentinelRef,
    retryLoadOlderMessages: loadOlderMessages,
  };
};
