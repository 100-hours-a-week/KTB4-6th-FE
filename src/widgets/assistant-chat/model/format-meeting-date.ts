import { parseServerDate } from '@/shared/lib';

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: 'long',
  day: 'numeric',
});

const weekdayFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  weekday: 'short',
});

const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export const formatMeetingDate = (value: string) => dateFormatter.format(parseServerDate(value));

export const formatMeetingDateTime = (value: string) => {
  const date = parseServerDate(value);
  return `${dateFormatter.format(date)} (${weekdayFormatter.format(date)}) ${timeFormatter.format(date)}`;
};
