import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';
import { VoiceEnrollResult } from './VoiceEnrollResult';

type VoiceEnrollFailedReason = 'retry' | 'rerecord' | 'file';

const FAILED_DESCRIPTIONS: Record<VoiceEnrollFailedReason, ReactNode> = {
  retry: (
    <>
      일시적인 문제로 음성 정보를 저장하지 못했어요.
      <br />
      녹음한 내용으로 다시 시도해 볼게요.
    </>
  ),
  rerecord: (
    <>
      녹음한 목소리를 분석하지 못했어요.
      <br />
      처음부터 다시 녹음해 주세요.
    </>
  ),
  file: (
    <>
      일시적인 문제로 녹음을 저장하지 못했어요.
      <br />
      처음부터 다시 녹음해 주세요.
    </>
  ),
};

interface VoiceEnrollFailedStepProps {
  reason: VoiceEnrollFailedReason;
  onRetry: () => void;
  onRestart: () => void;
}

export const VoiceEnrollFailedStep = ({
  reason,
  onRetry,
  onRestart,
}: VoiceEnrollFailedStepProps) => {
  const canRetry = reason === 'retry';

  return (
    <VoiceEnrollResult title="등록하지 못했어요" description={FAILED_DESCRIPTIONS[reason]}>
      {canRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-[52px] rounded-xl bg-brand-600 text-[15px] font-semibold text-white transition-colors hover:bg-brand-700"
        >
          다시 시도
        </button>
      )}
      <button
        type="button"
        onClick={onRestart}
        className={cn(
          'rounded-xl font-semibold transition-colors',
          canRetry
            ? 'min-h-12 text-sm text-cool-600 hover:bg-cool-50'
            : 'min-h-[52px] bg-brand-600 text-[15px] text-white hover:bg-brand-700',
        )}
      >
        처음부터 다시 녹음
      </button>
    </VoiceEnrollResult>
  );
};
