import { SummarySkeletonCards } from './SummarySkeletonCards';

export const SummaryGeneratingState = () => (
  <div className="flex flex-col gap-3 px-5 py-5">
    <section
      role="status"
      aria-live="polite"
      className="flex items-start gap-3.5 rounded-2xl border border-cool-200 bg-white p-4"
    >
      <span
        aria-hidden="true"
        className="mt-0.5 size-6 shrink-0 rounded-full border-[3px] border-cool-200 border-t-brand-600 motion-safe:animate-spin"
      />
      <div className="min-w-0">
        <h2 className="text-base font-bold text-cool-900">요약이 생성 중입니다.</h2>
        <p className="mt-2 text-sm leading-6 text-cool-600">
          회의 내용을 분석해 AI 요약을 만들고 있어요.
          <br />
          잠시만 기다려주세요.
        </p>
      </div>
    </section>

    <SummarySkeletonCards />
  </div>
);
