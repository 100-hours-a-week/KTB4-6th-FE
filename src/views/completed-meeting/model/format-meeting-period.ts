const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
});

const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const getParts = (formatter: Intl.DateTimeFormat, date: Date) =>
  Object.fromEntries(formatter.formatToParts(date).map(({ type, value }) => [type, value]));

/** `2026-08-25 (화) 10:00 ~ 13:00` 형태로 회의 진행 시간을 표시한다. */
export const formatMeetingPeriod = (startedAt: string, endedAt: string) => {
  const started = new Date(startedAt);
  const ended = new Date(endedAt);
  const { year, month, day, weekday } = getParts(dateFormatter, started);
  const startedTime = getParts(timeFormatter, started);
  const endedTime = getParts(timeFormatter, ended);

  return `${year}-${month}-${day} (${weekday}) ${startedTime.hour}:${startedTime.minute} ~ ${endedTime.hour}:${endedTime.minute}`;
};
