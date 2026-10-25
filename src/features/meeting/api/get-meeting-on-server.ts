import 'server-only';

import { getApiOnServer } from '@/shared/api/index.server';
import type { MeetingDetailData, MeetingTranscriptSegmentData } from '../model/types';

export const getMeetingDetailOnServer = (meetingId: number, accessToken: string) =>
  getApiOnServer<MeetingDetailData>(`/api/v1/meetings/${meetingId}`, accessToken);

export const getMeetingTranscriptOnServer = async (
  meetingId: number,
  accessToken: string,
): Promise<MeetingTranscriptSegmentData[]> => {
  const data = await getApiOnServer<{ segments: MeetingTranscriptSegmentData[] }>(
    `/api/v1/meetings/${meetingId}/transcripts`,
    accessToken,
  );
  return data.segments;
};
