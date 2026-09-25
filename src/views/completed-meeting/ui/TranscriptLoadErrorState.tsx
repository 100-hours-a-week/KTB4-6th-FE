interface TranscriptLoadErrorStateProps {
  onRetry: () => void;
}

/** 전사 조회에 실패했을 때 보여준다. */
export const TranscriptLoadErrorState = ({ onRetry }: TranscriptLoadErrorStateProps) => (
  <div className="px-5 py-5">
    <section
      role="alert"
      className="flex flex-col items-center rounded-2xl border border-cool-200 bg-white px-4 py-8 text-center"
    >
      <h2 className="text-base font-bold text-cool-900">전사를 불러오지 못했습니다</h2>
      <p className="mt-2 text-sm leading-6 text-cool-600">잠시 후 다시 시도해주세요.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 h-12 w-full max-w-[220px] rounded-xl bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        다시 불러오기
      </button>
    </section>
  </div>
);
