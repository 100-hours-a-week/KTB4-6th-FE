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
  // TODO(재생성 사유): 백엔드가 reason을 받게 되면 이 eslint-disable을 지우고 아래 본문 전송 주석을 푼다.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  request: RequestMeetingSummaryRequest,
): Promise<MeetingSummaryRequestData> => {
  try {
    const response = await apiClient.post<MeetingSummaryRequestResponse>(
      `/api/v1/meetings/${meetingId}/summaries`,
      // TODO(재생성 사유): 백엔드가 아직 reason을 받지 않아 임시로 본문 없이 요청한다.
      // request,
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
