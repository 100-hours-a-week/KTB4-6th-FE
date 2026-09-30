import { apiClient } from '@/shared/api';

import { toMeetingApiError } from '../model/errors';
import type { MeetingSummaryData, MeetingSummaryResponse } from '../model/types';

const SUMMARY_NOT_FOUND_CODE = 'SUMMARY_NOT_FOUND';

/**
 * 회의의 최신 AI 요약을 조회한다.
 * 요약은 회의 종료 후 서버가 만들기 때문에 아직 없다는 응답(SUMMARY_NOT_FOUND)은 오류가 아니라 null로 돌려준다.
 * 회의가 없는 경우(MEETING_NOT_FOUND) 등 다른 오류는 그대로 던진다.
 */
export const getMeetingSummary = async (meetingId: number): Promise<MeetingSummaryData | null> => {
  try {
    const response = await apiClient.get<MeetingSummaryResponse>(
      `/api/v1/meetings/${meetingId}/summaries`,
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('회의 요약을 조회하지 못했습니다.');
    }

    return result.data;
  } catch (error) {
    const apiError = toMeetingApiError(error, '회의 요약을 조회하지 못했습니다.');

    if (apiError.code === SUMMARY_NOT_FOUND_CODE) return null;
    throw apiError;
  }
};
