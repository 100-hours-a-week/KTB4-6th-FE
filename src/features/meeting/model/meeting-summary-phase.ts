import type { MeetingSummaryData } from './types';

export type MeetingSummaryPhase = 'generating' | 'completed' | 'failed';

/**
 * 조회한 요약이 화면에서 어떤 단계인지 알려준다.
 * 아직 없거나(null) 완료·실패가 아닌 모든 상태는 생성 중으로 본다. 그래서 서버가 상태 값을 추가해도 생성 중으로 표시된다.
 */
export const getMeetingSummaryPhase = (summary: MeetingSummaryData | null): MeetingSummaryPhase => {
  if (!summary) return 'generating';
  if (summary.status === 'FAILED') return 'failed';
  if (summary.status === 'COMPLETED' && summary.content !== null) return 'completed';

  return 'generating';
};
