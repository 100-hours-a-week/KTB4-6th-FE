import Link from 'next/link';

interface SummaryFailedStateProps {
  transcriptHref: string;
}

// TODO: 다시 시도 버튼은 요약 재생성 API와 연결한다.
export const SummaryFailedState = ({ transcriptHref }: SummaryFailedStateProps) => (
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
          className="h-12 rounded-xl bg-brand-600 text-sm font-semibold text-white"
        >
          다시 시도
        </button>
      </div>
    </section>
  </div>
);
