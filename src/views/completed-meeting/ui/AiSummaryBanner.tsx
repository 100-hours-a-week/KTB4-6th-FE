'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/shared/lib';
import {
  SUMMARY_REGENERATE_CREDIT_COST,
  canRegenerateSummary,
} from '../model/summary-regenerate-credit';
import { SummaryRegenerateConfirmDialog } from './SummaryRegenerateConfirmDialog';
import { SummaryRegenerateReasonDialog } from './SummaryRegenerateReasonDialog';

interface AiSummaryBannerProps {
  currentCredits: number;
  isRegenerating: boolean;
  /** 재생성을 요청한다. 시작됐으면 true, 실패했으면 false */
  onRegenerate: (reason: string) => Promise<boolean>;
}

export const AiSummaryBanner = ({
  currentCredits,
  isRegenerating,
  onRegenerate,
}: AiSummaryBannerProps) => {
  const [step, setStep] = useState<'reason' | 'confirm' | null>(null);
  const [reason, setReason] = useState('');
  const canRegenerate = canRegenerateSummary(currentCredits);

  const closeDialog = () => {
    setStep(null);
    setReason('');
  };

  const handleNext = (nextReason: string) => {
    setReason(nextReason);
    setStep('confirm');
  };

  const handleConfirmRegenerate = async () => {
    const isStarted = await onRegenerate(reason);
    if (isStarted) closeDialog();
  };

  return (
    <>
      <section className="flex items-center justify-between gap-3 rounded-2xl bg-brand-100 p-4">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-brand-800">AI 요약</h2>
          <p className="mt-1 text-xs text-cool-500">
            {canRegenerate
              ? '회의의 주요 내용을 AI로 요약했어요'
              : `재생성에 ${SUMMARY_REGENERATE_CREDIT_COST} 크레딧 필요 · 현재 ${currentCredits} 크레딧`}
          </p>
        </div>
        <button
          type="button"
          disabled={!canRegenerate}
          onClick={() => setStep('reason')}
          className={cn(
            'flex h-10 shrink-0 items-center gap-1.5 rounded-lg border px-3.5 text-sm font-semibold',
            canRegenerate
              ? 'border-cool-200 bg-white text-brand-800'
              : 'border-cool-200 bg-cool-100 text-cool-400',
          )}
        >
          요약 재생성
          <RefreshCw aria-hidden="true" className="size-4" strokeWidth={2} />
        </button>
      </section>
      {step === 'reason' && (
        <SummaryRegenerateReasonDialog onNext={handleNext} onClose={closeDialog} />
      )}
      {step === 'confirm' && (
        <SummaryRegenerateConfirmDialog
          isRegenerating={isRegenerating}
          onConfirm={handleConfirmRegenerate}
          onClose={closeDialog}
        />
      )}
    </>
  );
};
