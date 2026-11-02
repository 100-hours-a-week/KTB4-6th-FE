'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  isInsufficientCreditError,
  isSummaryAlreadyProcessingError,
  useRequestMeetingSummary,
} from '@/features/meeting';
import { teamKeys, type TeamCreditsData } from '@/features/team-management';
import { useAppToast } from '@/shared/ui';

interface UseSummaryRegenerationParams {
  meetingId: number;
  teamId: number;
}

export const useSummaryRegeneration = ({ meetingId, teamId }: UseSummaryRegenerationParams) => {
  const { showToast } = useAppToast();
  const queryClient = useQueryClient();
  const request = useRequestMeetingSummary(meetingId);

  const regenerate = async (reason: string) => {
    if (request.isPending) return false;

    try {
      const result = await request.mutateAsync(reason);
      queryClient.setQueryData<TeamCreditsData>(teamKeys.credits(teamId), (current) =>
        current ? { ...current, balance: result.creditBalance } : current,
      );
      showToast('요약 재생성을 시작했습니다', 'success');
      return true;
    } catch (error) {
      if (isSummaryAlreadyProcessingError(error)) {
        showToast('이미 요약을 생성하고 있습니다', 'info');
        return true;
      }
      if (isInsufficientCreditError(error)) {
        await queryClient.invalidateQueries({ queryKey: teamKeys.credits(teamId) });
        const credits = queryClient.getQueryData<TeamCreditsData>(teamKeys.credits(teamId));
        showToast(
          credits
            ? `크레딧이 부족해 재생성할 수 없습니다. 현재 ${credits.balance} 크레딧`
            : '크레딧이 부족해 재생성할 수 없습니다.',
          'danger',
        );
        return true;
      }
      showToast('요약 재생성에 실패했습니다. 다시 시도해주세요.', 'danger');
      return false;
    }
  };

  return { isRegenerating: request.isPending, regenerate };
};
