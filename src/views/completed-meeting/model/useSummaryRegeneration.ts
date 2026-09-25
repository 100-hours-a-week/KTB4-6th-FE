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
  /** 개발 환경 전용 미리보기이면 요청하지 않고 성공한 것처럼 안내만 한다. */
  isPreview: boolean;
}

/** 요약 재생성 요청과 그 결과 안내(토스트), 팀 크레딧 잔액 갱신을 맡는다. */
export const useSummaryRegeneration = ({
  meetingId,
  teamId,
  isPreview,
}: UseSummaryRegenerationParams) => {
  const { showToast } = useAppToast();
  const queryClient = useQueryClient();
  const request = useRequestMeetingSummary(meetingId);

  /**
   * 요청을 마쳐서 사유·확인 모달을 닫아도 되면 true.
   * 요청이 실패해서 같은 모달에서 다시 시도할 수 있어야 할 때만 false다.
   */
  const regenerate = async (reason: string) => {
    if (isPreview) {
      showToast('요약 재생성을 시작했습니다', 'success');
      return true;
    }
    if (request.isPending) return false;

    try {
      const result = await request.mutateAsync(reason);
      // 응답의 차감 후 잔액을 크레딧 표시(사이드바, 재생성 버튼)에 바로 반영한다.
      queryClient.setQueryData<TeamCreditsData>(teamKeys.credits(teamId), (current) =>
        current ? { ...current, balance: result.creditBalance } : current,
      );
      showToast('요약 재생성을 시작했습니다', 'success');
      return true;
    } catch (error) {
      // 이미 생성 중이면 새로 요청할 필요 없이 진행 중인 생성을 따라가면 된다.
      if (isSummaryAlreadyProcessingError(error)) {
        showToast('이미 요약을 생성하고 있습니다', 'info');
        return true;
      }
      // 크레딧이 부족하면 다시 시도해도 같아서, 최신 잔액을 다시 불러와 안내하고 모달을 닫는다.
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
