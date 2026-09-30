/** 전사 발화 시각과 음성 재생 시간을 `mm:ss`로 표시한다. */
export const formatTimestamp = (seconds: number) =>
  [Math.floor(seconds / 60), seconds % 60].map((part) => String(part).padStart(2, '0')).join(':');
