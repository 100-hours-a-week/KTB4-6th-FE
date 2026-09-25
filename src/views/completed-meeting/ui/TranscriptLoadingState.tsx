const SKELETON_ROWS = ['w-full', 'w-[85%]', 'w-full', 'w-3/4'];

/** 전사를 처음 불러오는 동안 검색창과 전사 항목이 들어올 자리를 회색으로 보여준다. */
export const TranscriptLoadingState = () => (
  <div
    role="status"
    aria-label="전사를 불러오는 중입니다"
    className="flex flex-col gap-3 px-5 py-5"
  >
    <div aria-hidden="true" className="h-12 rounded-xl border border-cool-200 bg-white" />
    <div aria-hidden="true" className="flex flex-col gap-2">
      {SKELETON_ROWS.map((textWidth, index) => (
        <div key={index} className="flex items-start gap-3.5 rounded-2xl bg-white/60 px-3 py-3.5">
          <div className="flex w-[68px] shrink-0 flex-col gap-2">
            <div className="h-3.5 w-3/4 rounded-md bg-cool-100" />
            <div className="h-3 w-1/2 rounded-md bg-cool-100" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className={`h-3.5 rounded-md bg-cool-100 ${textWidth}`} />
            <div className="h-3.5 w-2/3 rounded-md bg-cool-100" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
