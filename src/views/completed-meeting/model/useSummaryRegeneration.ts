'use client';

import { isSummaryAlreadyProcessingError, useRequestMeetingSummary } from '@/features/meeting';
import { useAppToast } from '@/shared/ui';

interface UseSummaryRegenerationParams {
  meetingId: number;
  /** 개발 환경 전용 미리보기이면 요청하지 않고 성공한 것처럼 안내만 한다. */
  isPreview: boolean;
}

/** 요약 재생성 요청과 그 결과 안내(토스트)를 맡는다. */
export const useSummaryRegeneration = ({ meetingId, isPreview }: UseSummaryRegenerationParams) => {
  const { showToast } = useAppToast();
  const request = useRequestMeetingSummary(meetingId);

  /** 재생성이 시작됐으면 true. 실패하면 false여서 사유·확인 모달을 열어 둔 채 다시 시도할 수 있다. */
  const regenerate = async (reason: string) => {
    if (isPreview) {
      showToast('요약 재생성을 시작했습니다', 'success');
      return true;
    }
    if (request.isPending) return false;

    try {
      await request.mutateAsync(reason);
      showToast('요약 재생성을 시작했습니다', 'success');
      return true;
    } catch (error) {
      // 이미 생성 중이면 새로 요청할 필요 없이 진행 중인 생성을 따라가면 된다.
      if (isSummaryAlreadyProcessingError(error)) {
        showToast('이미 요약을 생성하고 있습니다', 'info');
        return true;
      }
      showToast('요약 재생성에 실패했습니다. 다시 시도해주세요.', 'danger');
      return false;
    }
  };

  return { isRegenerating: request.isPending, regenerate };
};
