'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestMeetingSummary } from '../api/request-meeting-summary';
import { MeetingApiError } from './errors';
import { meetingKeys } from './query-keys';

const SUMMARY_ALREADY_PROCESSING_CODE = 'SUMMARY_ALREADY_PROCESSING';
const INSUFFICIENT_CREDIT_CODE = 'INSUFFICIENT_CREDIT';

/** 이미 생성 중인 요약이 있어서 요청이 받아들여지지 않은 경우인지 */
export const isSummaryAlreadyProcessingError = (error: unknown) =>
  error instanceof MeetingApiError && error.code === SUMMARY_ALREADY_PROCESSING_CODE;

/** 팀 크레딧이 부족해서 요청이 받아들여지지 않은 경우인지 */
export const isInsufficientCreditError = (error: unknown) =>
  error instanceof MeetingApiError && error.code === INSUFFICIENT_CREDIT_CODE;

/**
 * 요약 재생성을 요청한다.
 * 요청이 접수되거나 이미 생성 중이라는 응답을 받으면, 새 요약이 만들어지는 과정을 따라가도록
 * 요약 조회 상태를 처음으로 되돌린다. (이전 조회의 완료 상태와 조회 횟수를 이어받지 않는다.)
 */
export const useRequestMeetingSummary = (meetingId: number) => {
  const queryClient = useQueryClient();
  const restartSummaryLookup = () =>
    queryClient.resetQueries({ queryKey: meetingKeys.summary(meetingId) });

  return useMutation({
    mutationFn: (reason: string) => requestMeetingSummary(meetingId, { reason: reason.trim() }),
    onSuccess: restartSummaryLookup,
    onError: (error) => {
      if (isSummaryAlreadyProcessingError(error)) void restartSummaryLookup();
    },
  });
};
