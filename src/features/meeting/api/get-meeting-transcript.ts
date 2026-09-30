import { apiClient } from '@/shared/api';

import { toMeetingApiError } from '../model/errors';
import type { MeetingTranscriptResponse, MeetingTranscriptSegmentData } from '../model/types';

/**
 * 회의의 전사를 조회한다. keyword를 주면 그 검색어와 일치하는 발화만 돌려준다.
 * 발화는 서버가 준 순서 그대로 돌려주고, 발화가 없으면 빈 배열이다.
 */
export const getMeetingTranscript = async (
  meetingId: number,
  keyword?: string,
): Promise<MeetingTranscriptSegmentData[]> => {
  try {
    const response = await apiClient.get<MeetingTranscriptResponse>(
      `/api/v1/meetings/${meetingId}/transcripts`,
      { params: { keyword } },
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('전사를 조회하지 못했습니다.');
    }

    return result.data.segments;
  } catch (error) {
    throw toMeetingApiError(error, '전사를 조회하지 못했습니다.');
  }
};
