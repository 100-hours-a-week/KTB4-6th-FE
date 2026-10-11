'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import type { TranscriptSegment } from './current-meeting';

interface UseTranscriptCitationNavigationParams {
  containerRef: RefObject<HTMLElement | null>;
  segments: TranscriptSegment[];
  targetSegmentId: string | null;
}

export const useTranscriptCitationNavigation = ({
  containerRef,
  segments,
  targetSegmentId,
}: UseTranscriptCitationNavigationParams) => {
  const handledSegmentIdRef = useRef<string | null>(null);
  const [citationHighlightedSegmentId, setCitationHighlightedSegmentId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!targetSegmentId) {
      handledSegmentIdRef.current = null;
      return;
    }
    if (handledSegmentIdRef.current === targetSegmentId) return;
    if (!segments.some((segment) => segment.id === targetSegmentId)) return;

    const frameId = window.requestAnimationFrame(() => {
      const container = containerRef.current;
      const target = container?.querySelector<HTMLElement>(
        `[data-transcript-segment-id="${targetSegmentId}"]`,
      );
      if (!container || !target) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const targetScrollTop =
        container.scrollTop +
        targetRect.top -
        containerRect.top -
        (container.clientHeight - targetRect.height) / 2;

      handledSegmentIdRef.current = targetSegmentId;
      setCitationHighlightedSegmentId(targetSegmentId);
      container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [containerRef, segments, targetSegmentId]);

  return citationHighlightedSegmentId === targetSegmentId ? citationHighlightedSegmentId : null;
};
