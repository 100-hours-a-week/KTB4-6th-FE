const SKELETON_CARDS = [
  { titleWidth: 'w-2/5', lineWidths: ['w-full', 'w-[85%]', 'w-3/5'] },
  { titleWidth: 'w-[28%]', lineWidths: ['w-full', 'w-[90%]', 'w-[70%]'] },
  { titleWidth: 'w-[42%]', lineWidths: ['w-full', 'w-4/5', 'w-1/2'] },
];

/** 요약 카드가 들어올 자리를 보여주는 회색 자리표시 카드 3개 */
export const SummarySkeletonCards = () =>
  SKELETON_CARDS.map(({ titleWidth, lineWidths }, index) => (
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
  ));
