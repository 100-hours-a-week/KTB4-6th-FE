'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SummaryRegenerateReasonDialog } from './SummaryRegenerateReasonDialog';

interface SummaryFailedStateProps {
  transcriptHref: string;
  isRetrying: boolean;
  /** 사유와 함께 요약 생성을 다시 요청한다. 요청을 마쳤으면 true */
  onRetry: (reason: string) => Promise<boolean>;
}

/** 요약 생성에 실패했을 때 보여준다. `다시 시도`는 재생성과 같은 사유 입력 모달을 거쳐 바로 요청한다. */
export const SummaryFailedState = ({
  transcriptHref,
  isRetrying,
  onRetry,
}: SummaryFailedStateProps) => {
  const [isReasonOpen, setIsReasonOpen] = useState(false);

  const handleSubmitReason = async (reason: string) => {
    const isFinished = await onRetry(reason);
    if (isFinished) setIsReasonOpen(false);
  };

  return (
    <>
      <div className="px-5 py-5">
        <section
          role="alert"
          className="rounded-2xl border border-l-4 border-cool-200 border-l-danger bg-white p-4"
        >
          <div className="flex items-start gap-3">
            <div
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-danger-bg text-base font-bold text-danger"
            >
              !
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-cool-900">요약 생성에 실패했습니다.</h2>
              <p className="mt-1.5 text-[13px] leading-5 break-all text-cool-600">
                전사는 정상적으로 저장되어 있어요. 다시 시도하거나 전사 탭에서 회의 내용을 확인할 수
                있습니다.
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href={transcriptHref}
              replace
              scroll={false}
              className="flex h-12 items-center justify-center rounded-xl border border-cool-200 bg-white text-sm font-semibold text-cool-700"
            >
              전사 보기
            </Link>
            <button
              type="button"
              onClick={() => setIsReasonOpen(true)}
              className="h-12 rounded-xl bg-brand-600 text-sm font-semibold text-white"
            >
              다시 시도
            </button>
          </div>
        </section>
      </div>
      {isReasonOpen && (
        <SummaryRegenerateReasonDialog
          submitLabel="다시 시도"
          isSubmitting={isRetrying}
          onNext={handleSubmitReason}
          onClose={() => setIsReasonOpen(false)}
        />
      )}
    </>
  );
};
