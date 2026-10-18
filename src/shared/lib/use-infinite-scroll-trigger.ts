'use client';

import { useEffect, useRef, type RefObject } from 'react';

const TRIGGER_MARGIN = '200px';

export const useInfiniteScrollTrigger = <T extends Element>(
  onIntersect: () => void,
  isEnabled: boolean,
  rootRef?: RefObject<Element | null>,
) => {
  const targetRef = useRef<T>(null);
  const onIntersectRef = useRef(onIntersect);

  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const target = targetRef.current;
    if (!isEnabled || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onIntersectRef.current();
      },
      { root: rootRef?.current ?? null, rootMargin: TRIGGER_MARGIN },
    );
    observer.observe(target);

    return () => observer.disconnect();
  }, [isEnabled, rootRef]);

  return targetRef;
};
