interface MeetingListErrorStateProps {
  onRetry: () => void;
}

/** 회의 목록 조회에 실패했을 때 목록 영역 자리에 보여준다. 헤더는 포함하지 않는다. */
export const MeetingListErrorState = ({ onRetry }: MeetingListErrorStateProps) => (
  <div className="mt-6 flex flex-1 flex-col px-5 pb-8">
    <section
      role="alert"
      className="flex flex-col items-center rounded-2xl border border-cool-200 bg-white px-4 py-8 text-center"
    >
      <h2 className="text-base font-bold text-cool-900">회의 목록을 불러오지 못했어요</h2>
      <p className="mt-2 text-sm leading-6 text-cool-600">잠시 후 다시 시도해주세요.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 h-12 w-full max-w-[220px] rounded-xl bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        다시 시도
      </button>
    </section>
  </div>
);
