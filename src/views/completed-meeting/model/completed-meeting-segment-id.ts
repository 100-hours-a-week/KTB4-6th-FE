export const parseCompletedMeetingSegmentId = (value: string | string[] | undefined) => {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;

  const segmentId = Number(value);
  return Number.isSafeInteger(segmentId) ? String(segmentId) : null;
};
