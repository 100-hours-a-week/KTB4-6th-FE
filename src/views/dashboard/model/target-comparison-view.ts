import { formatDurationSeconds } from '@/shared/lib';

export interface TargetComparisonBucket {
  startDate: string;
  endDate: string;
  targetDurationSeconds: number;
  actualDurationSeconds: number;
}

export interface SelectedBucketView {
  range: string;
  detail: string;
  overtime: string | null;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return { month, day, weekday: WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()] };
};

const formatBucketRange = (startDate: string, endDate: string) => {
  const start = parseDate(startDate);

  if (startDate === endDate) return `${start.month}월 ${start.day}일 (${start.weekday})`;

  const end = parseDate(endDate);
  const endLabel = end.month === start.month ? `${end.day}일` : `${end.month}월 ${end.day}일`;

  return `${start.month}월 ${start.day}일 – ${endLabel}`;
};

export const hasBucketMeetings = (bucket: TargetComparisonBucket) =>
  bucket.targetDurationSeconds > 0;

export const getDefaultBucketIndex = (buckets: TargetComparisonBucket[]) => {
  const lastIndexWithMeetings = buckets.findLastIndex(hasBucketMeetings);
  return lastIndexWithMeetings === -1 ? buckets.length - 1 : lastIndexWithMeetings;
};

export const toSelectedBucketView = (bucket: TargetComparisonBucket): SelectedBucketView => {
  const range = formatBucketRange(bucket.startDate, bucket.endDate);

  if (!hasBucketMeetings(bucket)) {
    return { range, detail: '종료된 회의가 없어요', overtime: null };
  }

  const overtimeSeconds = bucket.actualDurationSeconds - bucket.targetDurationSeconds;

  return {
    range,
    detail: `목표 ${formatDurationSeconds(bucket.targetDurationSeconds)} · 실제 ${formatDurationSeconds(bucket.actualDurationSeconds)}`,
    overtime: overtimeSeconds > 0 ? `· ${formatDurationSeconds(overtimeSeconds)} 초과` : null,
  };
};
