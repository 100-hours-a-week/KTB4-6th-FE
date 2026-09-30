'use client';

import { useEffect, useRef, useState } from 'react';

export type CopyStatus = 'idle' | 'copying' | 'success' | 'error';

const FEEDBACK_DURATION = 2000;

export const useCopyToClipboard = () => {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    },
    [],
  );

  const copyToClipboard = async (text: string) => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }

    setCopyStatus('copying');

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API is not available.');
      }

      await navigator.clipboard.writeText(text);
      setCopyStatus('success');

      feedbackTimerRef.current = setTimeout(() => {
        setCopyStatus('idle');
      }, FEEDBACK_DURATION);

      return true;
    } catch {
      setCopyStatus('error');

      feedbackTimerRef.current = setTimeout(() => {
        setCopyStatus('idle');
      }, FEEDBACK_DURATION);

      return false;
    }
  };

  return { copyStatus, copyToClipboard };
};
