'use client';

import { useEffect, useState } from 'react';

const FLOATING_ANCHOR_SELECTOR = '[data-floating-anchor]';

export const useFloatingAnchorOffset = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const frame = document.getElementById('app-frame');
    if (!frame) return;

    let anchor: Element | null = null;

    const measure = () => {
      setOffset(
        anchor
          ? Math.max(0, frame.getBoundingClientRect().bottom - anchor.getBoundingClientRect().top)
          : 0,
      );
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(frame);

    const syncAnchor = () => {
      const nextAnchor = frame.querySelector(FLOATING_ANCHOR_SELECTOR);
      if (nextAnchor === anchor) return;

      if (anchor) resizeObserver.unobserve(anchor);
      anchor = nextAnchor;
      if (anchor) resizeObserver.observe(anchor);
      measure();
    };

    const mutationObserver = new MutationObserver(syncAnchor);
    mutationObserver.observe(frame, { childList: true, subtree: true });
    syncAnchor();

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return offset;
};
