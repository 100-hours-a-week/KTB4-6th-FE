import { useTeamCredits } from '@/features/team-management';
import type { MeetingSummaryStatus } from '../model/preview-completed-meeting';
import { useSummaryRegeneration } from '../model/useSummaryRegeneration';
import { useSummaryViewState } from '../model/useSummaryViewState';
import { SummaryFailedState } from './SummaryFailedState';
import { SummaryGeneratingState } from './SummaryGeneratingState';
import { SummaryLoadErrorState } from './SummaryLoadErrorState';
import { SummaryLoadingState } from './SummaryLoadingState';
import { SummaryTab } from './SummaryTab';

interface SummaryScreenProps {
  meetingId: number;
  teamId: number;
  /** 개발 환경 전용 미리보기 요약 상태. 없으면 요약을 조회한다. */
  previewSummaryStatus?: MeetingSummaryStatus;
  /** 개발 환경 전용 미리보기 크레딧. 없으면 팀 크레딧을 조회한다. */
  previewCredits?: number;
  /** 요약 실패 화면의 `전사 보기`가 이동할 주소 */
  transcriptHref: string;
}

/**
 * 요약 탭 화면. 요약 상태(불러오는 중·생성 중·실패·조회 오류·완료)에 맞는 내용을 스크롤 영역에 보여준다.
 * 생성 중에는 주기적으로 다시 조회해 완료되면 화면이 바뀐다.
 */
export const SummaryScreen = ({
  meetingId,
  teamId,
  previewSummaryStatus,
  previewCredits,
  transcriptHref,
}: SummaryScreenProps) => {
  const { state, retry } = useSummaryViewState({
    meetingId,
    previewStatus: previewSummaryStatus,
  });
  const isPreview = previewSummaryStatus !== undefined;
  const { isRegenerating, regenerate } = useSummaryRegeneration({ meetingId, teamId, isPreview });
  const creditsQuery = useTeamCredits(teamId);
  // 조회 전에는 잔액을 알 수 없어(null) 재생성을 막지 않고, 서버가 요청 때 확인한다.
  const currentCredits = isPreview
    ? (previewCredits ?? null)
    : (creditsQuery.data?.balance ?? null);

  return (
    <main data-tab="summary" className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {state.kind === 'loading' && <SummaryLoadingState />}
      {state.kind === 'generating' && <SummaryGeneratingState />}
      {state.kind === 'failed' && (
        <SummaryFailedState
          transcriptHref={transcriptHref}
          isRetrying={isRegenerating}
          onRetry={regenerate}
        />
      )}
      {state.kind === 'error' && <SummaryLoadErrorState onRetry={retry} />}
      {state.kind === 'completed' && (
        <SummaryTab
          content={state.content}
          currentCredits={currentCredits}
          isRegenerating={isRegenerating}
          onRegenerate={regenerate}
        />
      )}
    </main>
  );
};
