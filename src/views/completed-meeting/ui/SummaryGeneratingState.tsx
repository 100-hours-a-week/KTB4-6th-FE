const SKELETON_CARDS = [
  { titleWidth: 'w-2/5', lineWidths: ['w-full', 'w-[85%]', 'w-3/5'] },
  { titleWidth: 'w-[28%]', lineWidths: ['w-full', 'w-[90%]', 'w-[70%]'] },
  { titleWidth: 'w-[42%]', lineWidths: ['w-full', 'w-4/5', 'w-1/2'] },
];

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

    {SKELETON_CARDS.map(({ titleWidth, lineWidths }, index) => (
      <div
        key={index}
        aria-hidden="true"
        className="flex flex-col gap-2.5 rounded-2xl border border-cool-200/70 bg-white/60 p-4"
      >
        <div className={`h-4 rounded-md bg-cool-100 ${titleWidth}`} />
        <div className="mt-1 flex flex-col gap-2.5">
          {lineWidths.map((width) => (
            <div key={width} className={`h-3 rounded-md bg-cool-100 ${width}`} />
          ))}
        </div>
      </div>
    ))}
  </div>
);
