'use client';

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

const BOTTOM_THRESHOLD_PX = 80;

interface UseMeetingChatReverseScrollOptions {
  messageCount: number;
  messagesKey: string;
  ownQuestionMessageId: number | null;
  isInitialLoading: boolean;
  hasOlderMessages: boolean;
  isLoadingOlderMessages: boolean;
  hasLoadingOlderMessagesError: boolean;
  onLoadOlderMessages: () => Promise<unknown>;
}

export const useMeetingChatReverseScroll = ({
  messageCount,
  messagesKey,
  ownQuestionMessageId,
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
  const isAtBottomRef = useRef(true);
  const scrolledOwnQuestionMessageIdRef = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const distanceFromBottom =
      scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight;
    isAtBottomRef.current = distanceFromBottom <= BOTTOM_THRESHOLD_PX;
  }, []);

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
      scrolledOwnQuestionMessageIdRef.current = ownQuestionMessageId;
      return;
    }

    if (isPrependingRef.current) {
      if (isLoadingOlderMessages) return;

      if (messageCount > previousMessageCountRef.current) {
        const addedHeight = scrollContainer.scrollHeight - previousScrollHeightRef.current;
        scrollContainer.scrollTop = previousScrollTopRef.current + addedHeight;
      }

      isPrependingRef.current = false;
      return;
    }

    const hasNewOwnQuestion =
      ownQuestionMessageId !== null &&
      ownQuestionMessageId !== scrolledOwnQuestionMessageIdRef.current;

    if (hasNewOwnQuestion) scrolledOwnQuestionMessageIdRef.current = ownQuestionMessageId;
    if (!hasNewOwnQuestion && !isAtBottomRef.current) return;

    scrollContainer.scrollTop = scrollContainer.scrollHeight;
    isAtBottomRef.current = true;
  }, [isInitialLoading, isLoadingOlderMessages, messageCount, messagesKey, ownQuestionMessageId]);

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
    handleScroll,
    retryLoadOlderMessages: loadOlderMessages,
  };
};
