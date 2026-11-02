import { useTeamCredits } from '@/features/team-management';
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
  transcriptHref: string;
}

export const SummaryScreen = ({ meetingId, teamId, transcriptHref }: SummaryScreenProps) => {
  const { state, retry } = useSummaryViewState({ meetingId });
  const { isRegenerating, regenerate } = useSummaryRegeneration({ meetingId, teamId });
  const creditsQuery = useTeamCredits(teamId);
  const currentCredits = creditsQuery.data?.balance ?? null;

  return (
    <main
      data-tab="summary"
      data-clarity-mask="true"
      className="flex min-h-0 flex-1 flex-col overflow-y-auto"
    >
      {state.kind === 'loading' && <SummaryLoadingState />}
      {state.kind === 'generating' && <SummaryGeneratingState />}
      {state.kind === 'failed' && (
        <SummaryFailedState
          isTranscriptEmpty={state.isTranscriptEmpty}
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
