'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { TranscriptEntry } from './types';

interface UseTranscriptDeepLinkOptions {
  containerRef: RefObject<HTMLElement | null>;
  entries: TranscriptEntry[];
  targetEntryId: string | null;
  isEnabled: boolean;
}

export const useTranscriptDeepLink = ({
  containerRef,
  entries,
  targetEntryId,
  isEnabled,
}: UseTranscriptDeepLinkOptions) => {
  const handledEntryId = useRef<string | null>(null);
  const highlightedEntryId =
    isEnabled && targetEntryId && entries.some((entry) => entry.id === targetEntryId)
      ? targetEntryId
      : null;

  useEffect(() => {
    if (!highlightedEntryId) {
      handledEntryId.current = null;
      return;
    }
    if (handledEntryId.current === highlightedEntryId) return;

    const frameId = window.requestAnimationFrame(() => {
      const container = containerRef.current;
      const item = container?.querySelector<HTMLElement>(
        `[data-entry-id="${CSS.escape(highlightedEntryId)}"]`,
      );
      if (!container || !item) return;

      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const offsetToCenter =
        itemRect.top - containerRect.top - (container.clientHeight - itemRect.height) / 2;

      container.scrollTo({ top: container.scrollTop + offsetToCenter, behavior: 'auto' });
      handledEntryId.current = highlightedEntryId;
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [containerRef, highlightedEntryId]);

  return highlightedEntryId;
};
