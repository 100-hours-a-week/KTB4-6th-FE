'use client';

import { useEffect, useRef } from 'react';

const TRIGGER_MARGIN = '200px';

/**
 * 반환된 ref를 단 요소가 화면 하단 근처에 들어오면 onIntersect를 호출한다.
 * isEnabled가 false인 동안은 감시하지 않는다. 불러오는 중이거나 실패했을 때, 더 불러올 것이 없을 때 꺼서
 * 같은 요청이 반복되지 않게 하고, 다시 켜지면 요소가 이미 보이는 상태여도 곧바로 한 번 호출한다.
 */
export const useInfiniteScrollTrigger = <T extends Element>(
  onIntersect: () => void,
  isEnabled: boolean,
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
      { rootMargin: TRIGGER_MARGIN },
    );
    observer.observe(target);

    return () => observer.disconnect();
  }, [isEnabled]);

  return targetRef;
};
