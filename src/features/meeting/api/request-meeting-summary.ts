import { apiClient } from '@/shared/api';

import { toMeetingApiError } from '../model/errors';
import type {
  MeetingSummaryRequestData,
  MeetingSummaryRequestResponse,
  RequestMeetingSummaryRequest,
} from '../model/types';

/** 회의 요약 생성(재생성)을 요청한다. 요청이 접수되면(202) 생성은 서버에서 진행되고, 결과는 요약 조회로 확인한다. */
export const requestMeetingSummary = async (
  meetingId: number,
  request: RequestMeetingSummaryRequest,
): Promise<MeetingSummaryRequestData> => {
  try {
    const response = await apiClient.post<MeetingSummaryRequestResponse>(
      `/api/v1/meetings/${meetingId}/summaries`,
      request,
    );
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('회의 요약 생성 요청에 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    throw toMeetingApiError(error, '회의 요약 생성 요청에 실패했습니다.');
  }
};
