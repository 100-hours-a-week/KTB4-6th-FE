'use client';

import { getMeetingSummaryPhase, useMeetingSummary } from '@/features/meeting';
import type { MeetingSummaryStatus } from './preview-completed-meeting';
import { mockMeetingSummaryMarkdown } from './preview-meeting-summary';

export type SummaryViewState =
  /** 처음 불러오는 중 */
  | { kind: 'loading' }
  /** 아직 없거나 생성 중 */
  | { kind: 'generating' }
  /** 생성에 실패했거나 제한 시간 안에 끝나지 않음 */
  | { kind: 'failed' }
  /** 요약 조회 자체에 실패 */
  | { kind: 'error' }
  | { kind: 'completed'; content: string };

interface UseSummaryViewStateParams {
  meetingId: number;
  /** 개발 환경 전용 미리보기 요약 상태. 있으면 조회하지 않고 목데이터를 쓴다. */
  previewStatus?: MeetingSummaryStatus;
}

/** 요약 탭이 보여줄 화면 상태를 요약 조회 결과(또는 개발용 미리보기)로 정한다. */
export const useSummaryViewState = ({ meetingId, previewStatus }: UseSummaryViewStateParams) => {
  const summaryQuery = useMeetingSummary(meetingId, { isEnabled: previewStatus === undefined });

  const getState = (): SummaryViewState => {
    if (previewStatus) {
      return previewStatus === 'completed'
        ? { kind: 'completed', content: mockMeetingSummaryMarkdown }
        : { kind: previewStatus };
    }
    if (summaryQuery.isPending) return { kind: 'loading' };
    // 한 번이라도 조회에 성공했다면 이후의 일시적인 오류는 무시하고 계속 조회한다.
    if (summaryQuery.data === undefined) return { kind: 'error' };

    const phase = getMeetingSummaryPhase(summaryQuery.data);
    if (phase === 'failed') return { kind: 'failed' };
    if (phase === 'generating') {
      return summaryQuery.isPollingTimedOut ? { kind: 'failed' } : { kind: 'generating' };
    }

    return { kind: 'completed', content: summaryQuery.data?.content ?? '' };
  };

  return {
    state: getState(),
    retry: () => void summaryQuery.refetch(),
  };
};
