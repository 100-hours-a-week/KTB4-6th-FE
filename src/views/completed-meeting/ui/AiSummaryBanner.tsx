import { RefreshCw } from 'lucide-react';
import { cn } from '@/shared/lib';
import {
  SUMMARY_REGENERATE_CREDIT_COST,
  canRegenerateSummary,
} from '../model/summary-regenerate-credit';

interface AiSummaryBannerProps {
  currentCredits: number;
}

// TODO: 요약 재생성 버튼은 재생성 사유·확인 모달과 연결한다.
export const AiSummaryBanner = ({ currentCredits }: AiSummaryBannerProps) => {
  const canRegenerate = canRegenerateSummary(currentCredits);

  return (
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
  );
};
