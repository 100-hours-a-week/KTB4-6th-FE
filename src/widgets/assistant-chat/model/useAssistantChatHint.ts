'use client';

import { useEffect, useState } from 'react';

const HINT_DATE_STORAGE_KEY = 'meety:assistant-chat-hint-date';
const HINT_SHOW_DELAY_MS = 1000;
const HINT_VISIBLE_MS = 5000;

const getToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

const readHintDate = () => {
  try {
    return window.sessionStorage.getItem(HINT_DATE_STORAGE_KEY);
  } catch {
    return undefined;
  }
};

const writeHintDate = () => {
  try {
    window.sessionStorage.setItem(HINT_DATE_STORAGE_KEY, getToday());
  } catch {}
};

export const useAssistantChatHint = (isEnabled: boolean) => {
  const [isHintVisible, setIsHintVisible] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;

    const hintDate = readHintDate();
    if (hintDate === undefined || hintDate === getToday()) return;

    const showTimer = setTimeout(() => {
      writeHintDate();
      setIsHintVisible(true);
    }, HINT_SHOW_DELAY_MS);
    const hideTimer = setTimeout(
      () => setIsHintVisible(false),
      HINT_SHOW_DELAY_MS + HINT_VISIBLE_MS,
    );

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      setIsHintVisible(false);
    };
  }, [isEnabled]);

  const dismissHint = () => {
    writeHintDate();
    setIsHintVisible(false);
  };

  return { isHintVisible, dismissHint };
};
