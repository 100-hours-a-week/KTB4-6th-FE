'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMeetingSummary } from '../api/get-meeting-summary';
import { MeetingApiError } from './errors';
import { getMeetingSummaryPhase } from './meeting-summary-phase';
import { meetingKeys } from './query-keys';
import type { MeetingSummaryData } from './types';

// AI 요약은 보통 10초 안에 만들어져서, 요약이 완료되거나 실패할 때까지 10초 간격으로 다시 조회한다.
const SUMMARY_POLLING_INTERVAL_MS = 10_000;
// 2분(10초 간격 12회)이 지나도 끝나지 않으면 조회를 멈춘다.
const SUMMARY_POLLING_MAX_ATTEMPTS = 12;
const SUMMARY_LOOKUP_MAX_RETRIES = 2;

interface UseMeetingSummaryOptions {
  isEnabled?: boolean;
}

interface PollingState {
  data: MeetingSummaryData | null | undefined;
  dataUpdateCount: number;
  errorUpdateCount: number;
}

const hasReachedPollingLimit = ({ dataUpdateCount, errorUpdateCount }: PollingState) =>
  dataUpdateCount + errorUpdateCount >= SUMMARY_POLLING_MAX_ATTEMPTS;

// 요약이 아직 없거나(null) 생성 중이면 계속 조회한다. 한 번도 조회하지 못한 상태(undefined)는 재시도·수동 새로고침에 맡긴다.
const shouldKeepPolling = (state: PollingState) =>
  state.data !== undefined &&
  getMeetingSummaryPhase(state.data) === 'generating' &&
  !hasReachedPollingLimit(state);

// 권한 없음·회의 없음처럼 다시 요청해도 결과가 같은 4xx 오류는 재시도하지 않는다.
const shouldRetryLookup = (failureCount: number, error: Error) => {
  const isClientError =
    error instanceof MeetingApiError &&
    error.status !== undefined &&
    error.status >= 400 &&
    error.status < 500;

  return !isClientError && failureCount < SUMMARY_LOOKUP_MAX_RETRIES;
};

/**
 * 회의의 최신 AI 요약. 아직 요약이 없으면 data가 null이다.
 * 생성 중이거나 아직 없는 동안 주기적으로 다시 조회하고, 완료·실패하거나 제한 횟수를 넘기면 멈춘다.
 * 화면을 벗어나거나 브라우저 탭이 백그라운드로 가면 조회를 멈춘다.
 */
export const useMeetingSummary = (
  meetingId: number,
  { isEnabled = true }: UseMeetingSummaryOptions = {},
) => {
  const queryClient = useQueryClient();
  const queryKey = meetingKeys.summary(meetingId);
  const query = useQuery({
    queryKey,
    queryFn: () => getMeetingSummary(meetingId),
    enabled: isEnabled,
    retry: shouldRetryLookup,
    refetchInterval: (currentQuery) =>
      shouldKeepPolling(currentQuery.state) ? SUMMARY_POLLING_INTERVAL_MS : false,
  });

  // 제한 횟수까지 조회했는데도 생성 중이면, 끝나지 않는 것으로 본다.
  // 조회 횟수는 훅 결과에 없어서 캐시의 조회 상태에서 읽는다. 결과 데이터가 그대로여도 조회할 때마다 화면을 다시 그리도록 query 전체를 펼쳐 반환한다.
  const state = queryClient.getQueryState<MeetingSummaryData | null>(queryKey);
  const isPollingTimedOut =
    state !== undefined &&
    state.data !== undefined &&
    getMeetingSummaryPhase(state.data) === 'generating' &&
    hasReachedPollingLimit(state);

  return { ...query, isPollingTimedOut };
};
