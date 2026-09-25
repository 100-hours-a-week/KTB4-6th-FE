/** 전사 발화 시각을 `mm:ss`로 표시한다. */
export const formatTranscriptTime = (seconds: number) =>
  [Math.floor(seconds / 60), seconds % 60].map((part) => String(part).padStart(2, '0')).join(':');
